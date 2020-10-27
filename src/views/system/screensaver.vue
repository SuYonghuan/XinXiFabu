<template>
  <div class="screensaver-content">
    <!--  面包屑  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <p class="from-p">
        屏保时间
        <span>
          <el-input-number v-model="list.time" :min="1" :max="3600" label="描述文字"></el-input-number>
          秒
        </span>
      </p>
      <el-divider></el-divider>
      <p>图标设置</p>
      <div class="style-div">
        <div class="style-item" @click="clickStyle(index)" v-for="(item,index) of styleData"
             :class="{'style-active' : active == index}">
          <p class="style-title">{{item.title}}</p>
          <div class="item-div">
            <img v-show="item.img" :src="item.img" alt="">
          </div>
          <i class="el-icon-circle-check"></i>
        </div>
        <div class="style-item" @click="clickStyle(6)" :class="{'style-active' : active == 6}">
          <p class="style-title">提示图标样式自定义</p>
          <div class="item-div">
            <div @click.stop="">
              <el-upload
                      class="avatar-uploader"
                      :action="config.updateFile"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload">
                <i class="el-icon-plus avatar-uploader-icon"></i>
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
              </el-upload>
            </div>
          </div>
          <i class="el-icon-circle-check"></i>
        </div>
      </div>
      <p>图标效果</p>
      <p class="radio-p">
        <el-radio v-for="item of screenEffect" v-model="list.screenEffect" :label="item.value">{{item.label}}</el-radio>
      </p>
      <div class="radio-p">
        <p v-show="list.screenEffect == 0">
          <el-radio v-for="item of effectType[0]" v-model="list.effectType" :label="item.value">{{item.label}}
          </el-radio>
        </p>
        <p v-show="list.screenEffect == 1">
          <el-radio v-for="item of effectType[1]" v-model="list.effectType" :label="item.value">{{item.label}}
          </el-radio>
        </p>
      </div>

      <!--  表格  -->
      <p style="margin-top: 20px">默认屏保</p>
      <el-table :data="tableData" style="width: 100%;margin-bottom: 20px" height="320px">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="sName" label="分辨率"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="scope">
            <el-upload
                    class="upload-demo"
                    :action="config.updateFile"
                    :show-file-list="false"
                    :on-success="handleScreenSuccess"
                    :before-upload="beforeAvatarUpload"
                    multiple
                    :limit="1">
              <div @click="clickUpload(scope.row)">
                <img :src="scope.row.filePath" width="40" height="40" v-if="scope.row.filePath" alt="">
                <el-button size="small" type="primary" v-else>点击上传</el-button>
              </div>
            </el-upload>
          </template>
        </el-table-column>
      </el-table>
      <p class="button-p">
        <el-button type="primary" @click="clickSubmit" v-if="pageMenu.setScreen">确定</el-button>
      </p>
    </el-card>
    <!--  图片放大  -->
    <div class="max-img" v-show="maxImg" @click="maxDiv">
      <img :src="maxImg" alt="">
    </div>
  </div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {
		GetScreensaver,
		SetScreensaver,
		GetRolePermissions,
    ResolutionList,
    SetResolution,
	} from 'http/api/system'
	import {ERR_OK} from 'http/config'

	export default {
		name: "screensaver",
		data() {
			return {
				num: 30,
				styleData: [
					{
						title: '无提示图标',
						img: ''
					},
					{
						title: '提示图标样式一',
						img: require('../../common/images/touch1.gif')
					},
					{
						title: '提示图标样式二',
						img: require('../../common/images/touch2.gif')
					},
					{
						title: '提示图标样式三',
						img: require('../../common/images/touch3.gif')
					},
					{
						title: '提示图标样式四',
						img: require('../../common/images/touch4.gif')
					},
				],
				active: -1,
				imageUrl: '',
				list: {},
				pageMenu: {},
        screenEffect: [{label: '固定位置', value: 0}, {label: '自由运动', value: 1}],
        effectType: [
					[{label: '右下角显示', value: 0}, {label: '居中显示', value: 1}],
					[{label: '左右移动', value: 0}, {label: '随机移动', value: 1}]
				],
        tableData: [],
        maxImg: '',
        newData: {},
			}
		},
		created() {
			this.GetRolePermissions()
			this.ResolutionList()
		},
		methods: {
			/**
			 * 网络请求
			 * @param val
			 */
			GetRolePermissions() {
				const param = {
					MenuCode: this.presentMenu.code,
				}
				GetRolePermissions(param).then(res => {
					if (res.code === ERR_OK) {
						for (let a = 0; a < res.data.length; a++) {
							this.pageMenu[res.data[a].actionId] = true;
						}
			      this.GetScreensaver()
						console.log(this.pageMenu)
					}
				})
			},
			GetScreensaver() {
				const param = {
					MallCode: this.user.mallCode,
				}
				GetScreensaver(param).then(res => {
					if (res.code === ERR_OK) {
						this.list = res.data
						this.active = this.list.screenType
						this.imageUrl = this.list.screenFilePath
					}
				})
			},
			SetScreensaver(param) {
				SetScreensaver(param).then(res => {
					this.$message.success(res.msg);
					if (res.code === ERR_OK) {
						this.GetScreensaver()
					}
				})
			},
      SetResolution(param) {
        SetResolution(param).then(res => {
					if (res.code === ERR_OK) {
            this.$message.success(res.msg);
						this.ResolutionList()
            return
					}
          this.$message.error(res.msg);
				})
			},
      ResolutionList() {
        ResolutionList({}).then(res => {
					if (res.code === ERR_OK) {
						this.tableData = res.data
            console.log(this.tableData)
					}
				})
			},
			/**
			 * End
			 */
			clickStyle(index) {
				this.active = index
			},
			clickSubmit() {
				const param = {
					"Time": this.list.time,
					"ScreenType": this.active,
					"ScreenFile": this.list.screenFile,
					"ScreenEffect": this.list.screenEffect,
					"EffectType": this.list.effectType,
          "MallCode": this.user.mallCode,
				}
				this.SetScreensaver(param);
			},
			handleAvatarSuccess(res, file) {
				if (res.code === '200') {
					this.imageUrl = URL.createObjectURL(file.raw);
					this.list.screenFile = res.data.fileGuid;
					// this.list.screenFile = res.data.code;
				} else {
					this.$message.error('上传失败!');
				}
			},
			beforeAvatarUpload(file) {
				const isLt2M = file.size / 1024 / 1024 < 10;
				const type = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif']

				if (type.indexOf(file.type) === -1) {
					this.$message.error('上传图片只能是 jpg、png、gif格式!');
					return false
				}
				if (!isLt2M) {
					this.$message.error('上传图片大小不能超过 10MB!');
					return false
				}
			},
      //默认屏保
      handleScreenSuccess(res, file) {
        if (res.code === '200') {
          const param = {
            "Code":this.newData.code,
            "FilePath":res.data.filePath
          }
          this.SetResolution(param);
        } else {
          this.$message.error('上传失败!');
        }
      },
      //放大图片
      clickImg(item) {
        this.maxImg = item;
      },
      //关闭大图
      maxDiv() {
        this.maxImg = '';
      },
      //上传按钮
      clickUpload(item) {
			  this.newData = item
      },
		},
		computed: {
			...mapGetters(['config', 'user', "config", 'presentMenu'])
		}
	}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: absolute;
    bottom: 20px;
    right: 20px;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
  }

  .avatar {
    width: 60px;
    height: 60px;
    display: block;
  }
</style>
<style scoped lang="scss">
  .box-card {
    margin-top: 40px;
  }

  .from-p {
    display: flex;
    justify-content: space-between;
  }

  .style-div {
    display: flex;
    justify-content: space-between;

    .style-item {
      width: 216px;
      text-align: center;

      .style-title {
        line-height: 50px;
      }

      .item-div {
        border: 1px solid #ddd;
        height: 384px;
        width: 216px;
        position: relative;
        .avatar-uploader{
          display: block;
          width: 60px;
          height: 60px;
          position: absolute;
          bottom: 0px;
          right: 0px;
          img{
            position: absolute;
            bottom: 0px;
            right: 0px;
            z-index: 2;
          }
          .el-upload{
            height: 60px;
          }
          .avatar-uploader-icon{
            width: 60px;
            height: 60px;
          }
        }

        img {
          display: block;
          width: 60px;
          height: 60px;
          position: absolute;
          bottom: 20px;
          right: 20px;
        }
      }

      .el-icon-circle-check {
        line-height: 50px;
        font-size: 25px;
        color: #ddd;
      }
    }

    .style-active {
      .item-div {
        border: 1px solid #409EFF;
      }

      .el-icon-circle-check {
        color: #409EFF;
      }
    }
  }

  .radio-p {
    margin: 10px 0;
  }

  .button-p {
    text-align: center;
  }

  .max-img {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-height: 1080px;
      max-width: 1920px;
    }
  }
</style>
