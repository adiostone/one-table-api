import { PartyWS } from '@/modules/internal/party/partyServer'
import { nanoid } from 'nanoid'
import Restaurant from '@/models/Restaurant'
import Menu from '@/models/Menu'
import { Iamport } from 'ts-iamport'

export interface MenuInCart {
  id: number
  quantity: number
  unitPrice: number
  pricePerCapita: number
  name: string
  image: string
  isSharing: boolean
}

export interface Member {
  ws: PartyWS
  isHost: boolean
  isReady: boolean
  cart: MenuInCart[]
  isNonF2F: boolean
  nonF2FAddress: string
  phoneNumber: string
  request: string
  finalTotalPrice: number
  isPaid: boolean
}

export interface Chat {
  id: string
  nickname: string
  chat: string
}

export interface PaymentInfo {
  status: number
  message: string
  data: {
    amount: number
    status: string
  }
}

const iamport = new Iamport(
  process.env.IAMPORT_API_KEY,
  process.env.IAMPORT_API_SECRET
)

export default class PartyRoom {
  public id: string
  public restaurant: Restaurant
  public title: string
  public address: string
  public capacity: number
  public members: Member[]
  public chats: Chat[]
  public sharedCart: MenuInCart[]
  public isPaymentPhase: boolean
  public finalTotalPrice: number

  public async createParty(
    restaurantID: number,
    title: string,
    address: string,
    capacity: number,
    hostWS: PartyWS
  ): Promise<void> {
    ;[
      this.id,
      this.restaurant,
      this.title,
      this.address,
      this.capacity,
      this.members,
      this.chats,
      this.sharedCart,
      this.isPaymentPhase,
      this.finalTotalPrice
    ] = [
      nanoid(12),
      await Restaurant.findByPk(restaurantID),
      title,
      address,
      capacity,
      [
        {
          ws: hostWS,
          isHost: true,
          isReady: false,
          cart: [],
          isNonF2F: false,
          nonF2FAddress: '',
          phoneNumber: '',
          request: '',
          finalTotalPrice: 0,
          isPaid: false
        }
      ],
      [],
      [],
      false,
      0
    ]

    hostWS.roomID = this.id
  }

  public get size(): number {
    return this.members.length
  }

  public get host(): Member {
    return this.members.find(member => member.isHost)
  }

  public get totalPrice(): number {
    let sharedCartTotalPrice = 0
    for (const sharedMenu of this.sharedCart) {
      sharedCartTotalPrice += sharedMenu.unitPrice * sharedMenu.quantity
    }

    let privateCartTotalPrice = 0
    for (const member of this.members) {
      for (const privateMenu of member.cart) {
        privateCartTotalPrice += privateMenu.unitPrice * privateMenu.quantity
      }
    }

    return sharedCartTotalPrice + privateCartTotalPrice
  }

  public getMember(userID: string): Member | undefined {
    return this.members.find(member => member.ws.user.get('id') === userID)
  }

  public joinParty(ws: PartyWS): Member {
    if (ws.roomID !== null) {
      throw Error('this user is already joined to another party')
    }

    if (this.capacity <= this.size) {
      throw Error('this party room is already full')
    }

    if (this.isPaymentPhase) {
      throw Error('this party is already payment phase')
    }

    const newMember: Member = {
      ws: ws,
      isHost: false,
      isReady: false,
      cart: [],
      isNonF2F: false,
      nonF2FAddress: '',
      phoneNumber: '',
      request: '',
      finalTotalPrice: 0,
      isPaid: false
    }
    this.members.push(newMember)
    ws.roomID = this.id

    return newMember
  }

  public leaveParty(ws: PartyWS): Member {
    const memberIndex = this.members.findIndex(member => member.ws === ws)
    if (memberIndex === -1) {
      throw Error('user is not member of this party room')
    }

    if (this.isPaymentPhase) {
      throw Error('this party is already payment phase')
    }

    const outMember = this.members[memberIndex]
    this.members.splice(memberIndex, 1)
    ws.roomID = null

    // if out member is host and not empty, pick new host randomly
    if (outMember.isHost && this.size > 0) {
      const newHost = this.members[Math.floor(Math.random() * this.size)]
      newHost.isHost = true
      newHost.isReady = false
    }

    return outMember
  }

  public sendChat(ws: PartyWS, chat: string): void {
    if (this.getMember(ws.user.get('id')) === undefined) {
      throw Error('user is not member of this party room')
    }

    this.chats.push({
      id: ws.user.get('id'),
      nickname: ws.user.get('nickname'),
      chat: chat
    })
  }

  public async addToCart(
    ws: PartyWS,
    id: number,
    quantity: number,
    isShared: boolean
  ): Promise<MenuInCart> {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (member.isReady) {
      throw Error('cannot add menu when ready state')
    }
    if (this.isPaymentPhase) {
      throw Error('this party is already payment phase')
    }

    let cart: MenuInCart[]
    if (isShared) {
      if (!member.isHost) {
        throw Error('only host can add shared menu to cart')
      }

      cart = this.sharedCart
    } else {
      cart = member.cart
    }

    // if already exist this menu in the cart
    if (cart.find(menu => menu.id === id) !== undefined) {
      throw Error('this menu is already exist in the cart')
    }

    const menu = (
      await Menu.findByPk(id, {
        include: [
          {
            association: Menu.associations.prices,
            attributes: ['price']
          }
        ]
      })
    ).toJSON() as Menu

    if (menu.isSharing === false && isShared === true) {
      throw Error('this menu is not possible to share')
    }

    const unitPrice = menu.prices[0].price
    const totalPrice = unitPrice * quantity
    const menuInCart: MenuInCart = {
      id: id,
      quantity: quantity,
      unitPrice: unitPrice,
      pricePerCapita: isShared
        ? Math.floor(totalPrice / this.size)
        : totalPrice,
      name: menu.name,
      image: menu.image,
      isSharing: menu.isSharing
    }

    cart.push(menuInCart)

    // if shared menu, make all members to not ready state
    if (isShared) {
      for (const member of this.members) {
        member.isReady = false
      }
    }

    return menuInCart
  }

  public updateMenuInCart(
    ws: PartyWS,
    id: number,
    quantity: number,
    isShared: boolean
  ): MenuInCart {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (member.isReady) {
      throw Error('cannot update menu when ready state')
    }
    if (this.isPaymentPhase) {
      throw Error('this party is already payment phase')
    }

    let cart: MenuInCart[]
    if (isShared) {
      if (!member.isHost) {
        throw Error('only host can update shared menu in cart')
      }

      cart = this.sharedCart
    } else {
      cart = member.cart
    }

    const menuInCart = cart.find(menu => menu.id === id)
    // if the menu isn't exist in the cart
    if (menuInCart === undefined) {
      throw Error('this menu is not exist in the cart')
    }

    if (menuInCart.isSharing === false && isShared === true) {
      throw Error('this menu is not possible to share')
    }

    menuInCart.quantity = quantity
    const totalPrice = menuInCart.unitPrice * quantity
    menuInCart.pricePerCapita = isShared
      ? Math.floor(totalPrice / this.size)
      : totalPrice

    // if shared menu, make all members to not ready state
    if (isShared) {
      for (const member of this.members) {
        member.isReady = false
      }
    }

    return menuInCart
  }

  public deleteMenuInCart(
    ws: PartyWS,
    id: number,
    isShared: boolean
  ): MenuInCart {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (member.isReady) {
      throw Error('cannot delete menu when ready state')
    }
    if (this.isPaymentPhase) {
      throw Error('this party is already payment phase')
    }

    let cart: MenuInCart[]
    if (isShared) {
      if (!member.isHost) {
        throw Error('only host can delete shared menu in cart')
      }

      cart = this.sharedCart
    } else {
      cart = member.cart
    }

    const menuIndex = cart.findIndex(menu => menu.id === id)
    // if the menu isn't exist in the cart
    if (menuIndex === -1) {
      throw Error('this menu is not exist in the cart')
    }

    const menuInCart = cart[menuIndex]
    cart.splice(menuIndex, 1)

    // if shared menu, make all members to not ready state
    if (isShared) {
      for (const member of this.members) {
        member.isReady = false
      }
    }

    return menuInCart
  }

  public setReady(ws: PartyWS, isReady: boolean): Member {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (member.isHost) {
      throw Error('host cannot ready')
    }

    member.isReady = isReady

    return member
  }

  public async refreshSharedCart(): Promise<void> {
    for (const menuInCart of this.sharedCart) {
      const menu = await Menu.findByPk(menuInCart.id, {
        include: [
          {
            association: Menu.associations.prices,
            attributes: ['price']
          }
        ]
      })

      const totalPrice =
        menuInCart.quantity * (menu.toJSON() as Menu).prices[0].price

      menuInCart.pricePerCapita = Math.floor(totalPrice / this.size)
    }
  }

  public goToPayment(ws: PartyWS): void {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (!member.isHost) {
      throw Error('only host can go to payment phase')
    }
    if (!this.members.every(member => member.isHost || member.isReady)) {
      throw Error('all member must ready')
    }
    if (this.totalPrice < this.restaurant.get('minOrderPrice')) {
      throw Error('Total price must exceed minimum order price')
    }

    this.isPaymentPhase = true

    let sharedCartPricePerCapita = 0
    for (const sharedMenu of this.sharedCart) {
      sharedCartPricePerCapita +=
        sharedMenu.pricePerCapita + this.restaurant.get('packagingCost')
    }

    for (const member of this.members) {
      let privateCartPricePerCapita = 0

      for (const privateMenu of member.cart) {
        privateCartPricePerCapita += privateMenu.pricePerCapita
      }

      member.finalTotalPrice =
        sharedCartPricePerCapita +
        privateCartPricePerCapita +
        Math.floor(this.restaurant.get('deliveryCost') / this.size)
    }
  }

  public getReadyPayment(
    ws: PartyWS,
    isNonF2F: boolean,
    nonF2FAddress: string,
    phoneNumber: string,
    request: string
  ): number {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (!this.isPaymentPhase) {
      throw Error('this party is not payment phase')
    }

    member.isNonF2F = isNonF2F
    member.nonF2FAddress = nonF2FAddress
    member.phoneNumber = phoneNumber
    member.request = request

    return (
      member.finalTotalPrice +
      (isNonF2F ? this.restaurant.get('nonF2FCost') : 0)
    )
  }

  public async verifyPayment(ws: PartyWS, merchantUID: string): Promise<void> {
    const member = this.getMember(ws.user.get('id'))
    if (member === undefined) {
      throw Error('user is not member of this party room')
    }
    if (!this.isPaymentPhase) {
      throw Error('this party is not payment phase')
    }

    const expectedPaymentAmount =
      member.finalTotalPrice +
      (member.isNonF2F ? this.restaurant.get('nonF2FCost') : 0)

    const result = (await iamport.findByMerchantUid(merchantUID)) as PaymentInfo

    if (
      result.data.status === 'paid' &&
      result.data.amount === expectedPaymentAmount
    ) {
      member.isPaid = true
      member.finalTotalPrice = expectedPaymentAmount
      this.finalTotalPrice += member.finalTotalPrice
    } else {
      throw Error('Fail to payment')
    }
  }
}
