import { get, post } from '../http'
import {mergeWordAndTimeStamp, timeStamp} from "../../common/js/utils";
import store from '../../store'

//登陆
export const login = (param) =>
	post(`${store.state.config.url}/api/Account/Login?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/Login"))}&time=${timeStamp()}`,param)

//获取菜单
export const getMenu = (param) =>
	post(`${store.state.config.url}/api/menu/GetMenuInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/menu/GetMenuInfo"))}&time=${timeStamp()}`,param)

//获取设备运行状态
export const GetLineData = (param) =>
	post(`${store.state.config.url}/api/DevStatistics/GetLineData?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevStatistics/GetLineData"))}&time=${timeStamp()}`,param)

//获取设备状态
export const GetNowStatus = (param) =>
	post(`${store.state.config.url}/api/DevStatistics/GetNowStatus?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevStatistics/GetNowStatus"))}&time=${timeStamp()}`,param)

//获取未读消息
export const GetNoReadMessage = (param) =>
	post(`${store.state.config.url}/api/Detection/GetNoReadMessage?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Detection/GetNoReadMessage"))}&time=${timeStamp()}`,param)

//获取已读消息
export const GetAlreadyReadMessage = (param) =>
	post(`${store.state.config.url}/api/Detection/GetAlreadyReadMessage?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Detection/GetAlreadyReadMessage"))}&time=${timeStamp()}`,param)

//读消息
export const GetMessageInfo = (param) =>
	post(`${store.state.config.url}/api/Detection/GetMessageInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Detection/GetMessageInfo"))}&time=${timeStamp()}`,param)

//获取用户信息
export const GetUserInfo = (param) =>
	post(`${store.state.config.url}/api/Account/GetUserInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/GetUserInfo"))}&time=${timeStamp()}`,param)

//修改密码
export const ChangeSelfPassWord = (param) =>
	post(`${store.state.config.url}/api/Account/ChangeSelfPassWord?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/ChangeSelfPassWord"))}&time=${timeStamp()}`,param)

//修改用户信息
export const SelfEdit = (param) =>
	post(`${store.state.config.url}/api/Account/SelfEdit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/SelfEdit"))}&time=${timeStamp()}`,param)

//修改用户信息
export const ChangeSelfWord = (param) =>
	post(`${store.state.config.url}/api/Account/ChangeSelfWord?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Account/ChangeSelfWord"))}&time=${timeStamp()}`,param)

//注册
export const MallRegister = (param) =>
	post(`${store.state.config.url}/api/Cdn/MallRegister?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Cdn/MallRegister"))}&time=${timeStamp()}`,param)
