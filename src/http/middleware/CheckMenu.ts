import { NextHandler } from '@/http/HttpHandler'
import MenuCategory from '@/models/MenuCategory'
import Menu from '@/models/Menu'

export default class CheckMenu {
  public static handler: NextHandler = async (req, res, next) => {
    const menuCategory = res.locals.menuCategory as MenuCategory
    const menuID = req.params.menuID

    const menu = await Menu.findOne({
      where: { id: menuID, categoryID: menuCategory.get('id') }
    })

    if (menu === null) {
      res.status(404).json({
        err: {
          msg: 'Menu not exist'
        }
      })
    } else {
      res.locals.menu = menu
      next()
    }
  }
}
