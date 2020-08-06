import { get, post } from '../http'
import {mergeWordAndTimeStamp, timeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//获取素材上新统计
export const GetDeptPublishProgram = (param) =>
	post(`${store.state.config.url}/api/ProgramStatistics/GetDeptPublishProgram?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgramStatistics/GetDeptPublishProgram"))}&time=${timeStamp()}`,param)

//获取节目播放统计
export const GetProgramPlayRecord = (param) =>
	post(`${store.state.config.url}/api/ProgramStatistics/GetProgramPlayRecord?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgramStatistics/GetProgramPlayRecord"))}&time=${timeStamp()}`,param)

