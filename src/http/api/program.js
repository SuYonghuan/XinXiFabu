import { get, post } from '../http'
import {mergeWordAndTimeStamp, timeStamp} from "../../common/js/utils";
import store from '../../store'

//获取页面权限
export const GetRolePermissions = (param) =>
	post(`${store.state.config.url}/api/RolePermissions/GetRolePermissions?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/RolePermissions/GetRolePermissions"))}&time=${timeStamp()}`,param)

//获取楼栋列表
export const GetDeviceOptionsNew = (param) =>
	post(`${store.state.config.url}/api/Dev/GetDeviceOptionsNew?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Dev/GetDeviceOptionsNew"))}&time=${timeStamp()}`,param)

//获取节目列表
export const GetList = (param) =>
	post(`${store.state.config.url}/api/Prog/GetList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Prog/GetList"))}&time=${timeStamp()}`,param)

//快速发布节目
export const ProgAddFast = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/ProgAddFast?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/ProgAddFast"))}&time=${timeStamp()}`,param)

//发布节目
export const ProgAdd = (param) =>
	post(`${store.state.config.url}/api/prog/add?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/prog/add"))}&time=${timeStamp()}`,param)

//编辑节目
export const ProgEdit = (param) =>
	post(`${store.state.config.url}/api/prog/edit?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/prog/edit"))}&time=${timeStamp()}`,param)

//删除前查询提示信息
export const DelProgram_Pre = (param) =>
	post(`${store.state.config.url}/api/prog/DelProgram_Pre?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/prog/DelProgram_Pre"))}&time=${timeStamp()}`,param)

//删除节目
export const DelProgram = (param) =>
	post(`${store.state.config.url}/api/prog/DelProgram?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/prog/DelProgram"))}&time=${timeStamp()}`,param)

//节目已发布设备
export const GetPostionList = (param) =>
	post(`${store.state.config.url}/api/Prog/GetPostionList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Prog/GetPostionList"))}&time=${timeStamp()}`,param)

//获取店铺列表
export const QueryProgShopList = (param) =>
	post(`${store.state.config.url}/api/Prog/QueryProgShopList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Prog/QueryProgShopList"))}&time=${timeStamp()}`,param)

//设置关联店铺
export const SetProgToShop = (param) =>
	post(`${store.state.config.url}/api/Prog/SetProgToShop?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Prog/SetProgToShop"))}&time=${timeStamp()}`,param)

//获取标签列表
export const GetProgLabelList = (param) =>
	post(`${store.state.config.url}/api/LabelToObject/GetProgLabelList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/LabelToObject/GetProgLabelList"))}&time=${timeStamp()}`,param)

//获取标签列表
export const SetLabel = (param) =>
	post(`${store.state.config.url}/api/LabelToObject/Set?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/LabelToObject/Set"))}&time=${timeStamp()}`,param)

//获取节目组列表
export const GetProgGroupsByPage = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/GetProgGroupsByPage?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/GetProgGroupsByPage"))}&time=${timeStamp()}`,param)

//获取节目组节目列表
export const GetProgByGroupCode = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/GetProgByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/GetProgByGroupCode"))}&time=${timeStamp()}`,param)

//添加节目组
export const AddProgramGroup = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/AddProgramGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/AddProgramGroup"))}&time=${timeStamp()}`,param)

//修改节目组
export const UpdateGroupInfo = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/UpdateGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/UpdateGroupInfo"))}&time=${timeStamp()}`,param)

//删除节目组
export const DelProgramGroup = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/DelProgramGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/DelProgramGroup"))}&time=${timeStamp()}`,param)

//获取可发布设备
export const GetDeviceByGroupCode = (param) =>
	post(`${store.state.config.url}/api/dev/GetDeviceByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/dev/GetDeviceByGroupCode"))}&time=${timeStamp()}`,param)

//发布设备
export const PublishProgramToDevice = (param) =>
	post(`${store.state.config.url}/api/DevGroup/PublishProgramToDevice?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/DevGroup/PublishProgramToDevice"))}&time=${timeStamp()}`,param)

//获取设备组列表
export const GetDeviceGroupByProgGroup = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/GetDeviceGroupByProgGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/GetDeviceGroupByProgGroup"))}&time=${timeStamp()}`,param)

//发布设备组
export const PublishProgToDeviceGroup = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/PublishProgToDeviceGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/PublishProgToDeviceGroup"))}&time=${timeStamp()}`,param)

//获取节目组节目单
export const GetProgramListByGroupCode = (param) =>
	post(`${store.state.config.url}/api/ProgGroup/GetProgramListByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/ProgGroup/GetProgramListByGroupCode"))}&time=${timeStamp()}`,param)

//获取插播管理列表
export const GetNewsGroupList = (param) =>
	post(`${store.state.config.url}/api/News/GetNewsGroupList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/GetNewsGroupList"))}&time=${timeStamp()}`,param)

//新增插播
export const NewsAddFast = (param) =>
	post(`${store.state.config.url}/api/News/NewsAddFast?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/NewsAddFast"))}&time=${timeStamp()}`,param)

//获取插播详情
export const GetNewsGroupInfo = (param) =>
	post(`${store.state.config.url}/api/News/GetNewsGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/GetNewsGroupInfo"))}&time=${timeStamp()}`,param)

//更新插播
export const UpdateGroupNews = (param) =>
	post(`${store.state.config.url}/api/News/UpdateGroupInfo?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/UpdateGroupInfo"))}&time=${timeStamp()}`,param)

//删除插播
export const DelNewsGroup = (param) =>
	post(`${store.state.config.url}/api/News/DelNewsGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/DelNewsGroup"))}&time=${timeStamp()}`,param)

//发布设备
export const PublishNewsToDevice = (param) =>
	post(`${store.state.config.url}/api/News/PublishNewsToDevice?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/PublishNewsToDevice"))}&time=${timeStamp()}`,param)

//获取节目组设备
export const GetDeviceGroupByNewsGroup = (param) =>
	post(`${store.state.config.url}/api/News/GetDeviceGroupByNewsGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/GetDeviceGroupByNewsGroup"))}&time=${timeStamp()}`,param)

//节目发布设备组
export const PublishNewsToDeviceGroup = (param) =>
	post(`${store.state.config.url}/api/News/PublishNewsToDeviceGroup?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/PublishNewsToDeviceGroup"))}&time=${timeStamp()}`,param)

//停止插播
export const NewsStop = (param) =>
	post(`${store.state.config.url}/api/News/NewsStop?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/NewsStop"))}&time=${timeStamp()}`,param)

//获取插播素材
export const GetNewsListByGroupCode = (param) =>
	post(`${store.state.config.url}/api/News/GetNewsListByGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/GetNewsListByGroupCode"))}&time=${timeStamp()}`,param)

//获取插播设备
export const GetDevicesByNewsGroupCode = (param) =>
	post(`${store.state.config.url}/api/News/GetDevicesByNewsGroupCode?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/News/GetDevicesByNewsGroupCode"))}&time=${timeStamp()}`,param)

//获取插播设备
export const GetSubtitleList = (param) =>
	post(`${store.state.config.url}/api/Subtitle/GetList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/GetList"))}&time=${timeStamp()}`,param)

//添加字幕
export const SetSubtitle = (param) =>
	post(`${store.state.config.url}/api/Subtitle/Set?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/Set"))}&time=${timeStamp()}`,param)

//获取字幕详情
export const getSubtitle = (param) =>
	post(`${store.state.config.url}/api/Subtitle/Get?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/Get"))}&time=${timeStamp()}`,param)

//删除字幕
export const DelSubtitle = (param) =>
	post(`${store.state.config.url}/api/Subtitle/Del?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/Del"))}&time=${timeStamp()}`,param)

//获取字幕组设备
export const GetGroupList = (param) =>
	post(`${store.state.config.url}/api/Subtitle/GetGroupList?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/GetGroupList"))}&time=${timeStamp()}`,param)

//字幕发布设备组
export const PublishSubtitle = (param) =>
	post(`${store.state.config.url}/api/Subtitle/Publish?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/Publish"))}&time=${timeStamp()}`,param)

//字幕停止
export const SubtitleStop = (param) =>
	post(`${store.state.config.url}/api/Subtitle/SubtitleStop?token=${encodeURIComponent(mergeWordAndTimeStamp("/api/Subtitle/SubtitleStop"))}&time=${timeStamp()}`,param)
