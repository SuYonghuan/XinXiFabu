import { get, post } from '../http'
import {mergeWordAndTimeStamp, timeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//获取楼栋列表
export const GetBuildingList = (param) =>
	post(`${store.state.config.url}/API/Building/GetList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Building/GetList"))}&time=${timeStamp()}`,param)

//添加楼栋
export const AddBuilding = (param) =>
	post(`${store.state.config.url}/API/Building/Add?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Building/Add"))}&time=${timeStamp()}`,param)

//添加楼栋
export const EditBuilding = (param) =>
	post(`${store.state.config.url}/API/Building/Edit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Building/Edit"))}&time=${timeStamp()}`,param)

//删除楼栋
export const DelBuilding = (param) =>
	post(`${store.state.config.url}/API/Building/Del?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Building/Del"))}&time=${timeStamp()}`,param)

//获取楼层列表
export const GetFloorList = (param) =>
	post(`${store.state.config.url}/API/Floor/GetFloorList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Floor/GetFloorList"))}&time=${timeStamp()}`,param)

//添加楼层
export const AddFloor = (param) =>
	post(`${store.state.config.url}/API/Floor/Add?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Floor/Add"))}&time=${timeStamp()}`,param)

//编辑楼层
export const FloorEdit = (param) =>
	post(`${store.state.config.url}/API/Floor/FloorEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Floor/FloorEdit"))}&time=${timeStamp()}`,param)

//删除楼层
export const FloorDel = (param) =>
	post(`${store.state.config.url}/api/Floor/Del?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Floor/Del"))}&time=${timeStamp()}`,param)

//楼层排序
export const FloorOrderEdit = (param) =>
	post(`${store.state.config.url}/API/Floor/OrderEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Floor/OrderEdit"))}&time=${timeStamp()}`,param)

//获取业态列表
export const GetShopFormatList = (param) =>
	post(`${store.state.config.url}/API/ShopFormat/GetShopFormatList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/ShopFormat/GetShopFormatList"))}&time=${timeStamp()}`,param)

//添加业态
export const ShopFormatAdd = (param) =>
	post(`${store.state.config.url}/API/ShopFormat/ShopFormatAdd?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/ShopFormat/ShopFormatAdd"))}&time=${timeStamp()}`,param)

//获取业态详情
export const GetShopFormatInfo = (param) =>
	post(`${store.state.config.url}/API/ShopFormat/GetShopFormatInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/ShopFormat/GetShopFormatInfo"))}&time=${timeStamp()}`,param)

//修改业态
export const EditFormat = (param) =>
	post(`${store.state.config.url}/API/ShopFormat/SFEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/ShopFormat/SFEdit"))}&time=${timeStamp()}`,param)

//修改业态
export const ShopFormatDel = (param) =>
	post(`${store.state.config.url}/API/ShopFormat/ShopFormatDel?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/ShopFormat/ShopFormatDel"))}&time=${timeStamp()}`,param)

//获取品牌数据列表
export const PageShopList = (param) =>
	post(`${store.state.config.url}/API/Shop/PageShopList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/PageShopList"))}&time=${timeStamp()}`,param)

//添加品牌数据
export const ShopAdd = (param) =>
	post(`${store.state.config.url}/API/Shop/ShopAdd?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/ShopAdd"))}&time=${timeStamp()}`,param)

//获取品牌详情
export const GetShopInfo = (param) =>
	post(`${store.state.config.url}/API/Shop/GetShopInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/GetShopInfo"))}&time=${timeStamp()}`,param)

//编辑品牌
export const ShopEdit = (param) =>
	post(`${store.state.config.url}/API/Shop/ShopEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/ShopEdit"))}&time=${timeStamp()}`,param)

//删除品牌
export const ShopDel = (param) =>
	post(`${store.state.config.url}/API/Shop/ShopDel?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/ShopDel"))}&time=${timeStamp()}`,param)

//修改启用状态
export const ChangeShopStatus = (param) =>
	post(`${store.state.config.url}/API/Shop/ChangeShopStatus?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/ChangeShopStatus"))}&time=${timeStamp()}`,param)

//获取店铺列表
export const QueryShopList = (param) =>
	post(`${store.state.config.url}/API/Shop/QueryShopList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Shop/QueryShopList"))}&time=${timeStamp()}`,param)

//获取写字楼列表
export const PageOfficeList = (param) =>
	post(`${store.state.config.url}/API/Office/PageOfficeList?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/PageOfficeList"))}&time=${timeStamp()}`,param)

//添加写字楼公司
export const OfficeAdd = (param) =>
	post(`${store.state.config.url}/API/Office/OfficeAdd?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/OfficeAdd"))}&time=${timeStamp()}`,param)

//获取写字楼公司详情
export const GetOfficeInfo = (param) =>
	post(`${store.state.config.url}/API/Office/GetOfficeInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/GetOfficeInfo"))}&time=${timeStamp()}`,param)

//编辑写字楼公司
export const OfficeEdit = (param) =>
	post(`${store.state.config.url}/API/Office/OfficeEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/OfficeEdit"))}&time=${timeStamp()}`,param)

//删除写字楼公司
export const OfficeDel = (param) =>
	post(`${store.state.config.url}/API/Office/OfficeDel?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/OfficeDel"))}&time=${timeStamp()}`,param)

//修改写字楼状态
export const ChangeOfficeStatus = (param) =>
	post(`${store.state.config.url}/API/Office/ChangeOfficeStatus?token=${encodeURIComponent(mergeWordAndTimeStamp("/API/Office/ChangeOfficeStatus"))}&time=${timeStamp()}`,param)
