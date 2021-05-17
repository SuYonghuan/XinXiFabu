<template>
  <div v-if="form" class="pef">
    <el-row class="header" type="flex" justify="space-between">
      <el-col class="left">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconjiemuzhizuo"></use>
        </svg>
        节目制作
      </el-col>
      <el-col class="middle">
        <span class="meta1">节目名称</span>
        <input
          class="input1"
          :value="form.name"
          readonly
          style="pointer-events:none;"
        />
        <span class="meta1">屏幕属性</span>
        <input
          class="input1"
          :value="form.resolution"
          readonly
          style="pointer-events:none;"
        />
      </el-col>
      <el-col class="right">
        <div style="flex: 1"></div>
        <div class="btn" @click="preview">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconyanjing"></use>
          </svg>
          预览
        </div>
        <div class="btn success" @click="submit">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconchucun"></use>
          </svg>
          保存
        </div>
        <div class="btn primary" @click="$emit('close')">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconcha"></use>
          </svg>
          关闭
        </div>
      </el-col>
    </el-row>

    <div class="main">
      <div class="left">
        <template
          v-for="code in componentTypes
            ? componentTypeOrder.filter((code) => componentTypes[code])
            : []"
        >
          <el-popover
            v-if="componentTypeTip[code]"
            :key="code"
            placement="right"
            title="提示"
            trigger="hover"
            :content="componentTypeTip[code]"
          >
            <div class="btn" slot="reference" @click="appendComponent(code)">
              <svg class="icon" aria-hidden="true">
                <use :xlink:href="logos[code]"></use>
              </svg>
              {{ componentTypes[code] }}
            </div>
          </el-popover>
          <div class="btn" :key="code" v-else @click="appendComponent(code)">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="logos[code]"></use>
            </svg>
            {{ componentTypes[code] }}
          </div>
        </template>
      </div>
      <el-col :span="14" class="middle canvas-wrapper">
        <v-stage
          class="stage"
          :style="`transform: scale(${stageScale})`"
          :config="{
            width: form.width,
            height: form.height,
          }"
          @mousedown="handleStageMouseDown"
          @touchstart="handleStageMouseDown"
        >
          <v-layer>
            <background-color :form="form"></background-color>
            <background-image
              v-if="backgroundImage"
              :form="form"
              :backgroundImage="backgroundImage"
            ></background-image>
            <template v-for="(component, i) in form.components">
              <template
                v-if="component.image && component.typeCode === 'video'"
              >
                <container-rect
                  :form="form"
                  :i="i"
                  :component="component"
                  :key="i"
                  @dragend="handleDragend"
                  @transformend="handleTransformEnd"
                ></container-rect>
                <inner-image
                  :form="form"
                  :component="component"
                  :i="i"
                  :key="i + '_innerImage'"
                ></inner-image>
              </template>
              <image-component
                v-else-if="component.image"
                :form="form"
                :i="i"
                :key="i + '_' + component.image.id"
                @dragend="handleDragend"
                @transformend="handleTransformEnd"
              ></image-component>

              <template
                v-else-if="
                  component.typeCode === 'facility' ||
                    component.typeCode === 'brand' ||
                    component.typeCode === 'position'
                "
              >
                <template v-for="(subComponent, j) in component.subComponents">
                  <template v-if="subComponent.image">
                    <container-rect
                      :form="form"
                      :i="i"
                      :j="j"
                      :component="subComponent"
                      :key="i + '*' + j"
                      @dragend="handleDragend"
                      @transformend="handleTransformEnd"
                    ></container-rect>
                    <inner-image
                      :form="form"
                      :component="subComponent"
                      :i="i"
                      :key="i + '*' + j + '_innerImage'"
                    ></inner-image>
                  </template>
                  <template v-else>
                    <container-rect
                      :form="form"
                      :i="i"
                      :j="j"
                      :component="subComponent"
                      :key="i + '*' + j"
                      @dragend="handleDragend"
                      @transformend="handleTransformEnd"
                    ></container-rect>
                    <inner-text
                      :form="form"
                      :component="subComponent"
                      :i="i"
                      :key="i + '*' + j + '_text'"
                      :subComponentTypes="subComponentTypes"
                      :componentTypes="componentTypes"
                    >
                    </inner-text>
                  </template>
                </template>
              </template>
              <template v-else>
                <container-rect
                  :form="form"
                  :i="i"
                  :component="component"
                  :key="i"
                  @dragend="handleDragend"
                  @transformend="handleTransformEnd"
                ></container-rect>
                <inner-text
                  :form="form"
                  :component="component"
                  :i="i"
                  :key="i + '_text'"
                  :subComponentTypes="subComponentTypes"
                  :componentTypes="componentTypes"
                >
                </inner-text>
              </template>
            </template>
            <v-transformer
              ref="transformer"
              :config="{
                rotateEnabled: false,
                boundBoxFunc: transformBoundBoxFunc,
                enabledAnchors:
                  activeComponent &&
                  (activeComponent.typeCode === 'weather' ||
                    activeComponent.typeCode === 'clock')
                    ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                    : undefined,
              }"
            />
          </v-layer>
        </v-stage>
      </el-col>

      <el-form
        v-if="form"
        class="right"
        label-width="72px"
        label-position="left"
        ref="form"
        :model="form"
        :rules="rules"
      >
        <div class="r1">
          <h5>页面控件</h5>
          <component-list
            :logos="logos"
            :list="form.components"
            :activeComponent="activeComponent"
            :componentTypes="componentTypes"
            :componentSubMap="componentSubMap"
            :subComponentTypes="subComponentTypes"
            @selectBg="activeComponent = null"
            @remove="removeComponent"
            @selectComponent="setActiveComponent"
            @selectSubComponent="setActiveSubComponent"
            @toggleSubComponent="toggleSubComponent"
          ></component-list>
        </div>
        <div class="r2">
          <h5>节目设置</h5>
          <el-form-item class="item" label="节目时长" prop="duration">
            <el-time-picker
              class="input1"
              v-model="form.duration"
              value-format="HH:mm:ss"
              placeholder="选择时长"
            >
            </el-time-picker>
          </el-form-item>

          <h5>{{ activeComponent ? "元素属性" : "背景属性" }}</h5>
          <template v-if="!activeComponent">
            <el-form-item class="item" label="背景颜色" prop="backgroundColor">
              <el-color-picker
                :value="form.backgroundColor"
                @change="
                  (val) => {
                    if (val) form.backgroundColor = val;
                  }
                "
              >
              </el-color-picker>
            </el-form-item>
            <mat-list
              :data="form.backgroundMaterial ? [form.backgroundMaterial] : []"
              @preview="previewMat"
              @remove="form.backgroundMaterial = null"
              :limit="1"
              @selectMat="openMaterialModal"
            ></mat-list>
          </template>
          <template v-else>
            <div class="pos-items" v-if="!isSignComponentActive">
              <el-form-item
                label-width="18px"
                class="short-item"
                label="X"
                prop="offsetX"
              >
                <el-input-number
                  v-model="activeComponent.offsetX"
                  :min="0"
                  :max="form.width - activeComponent.width"
                  :step="1"
                  :controls="false"
                  step-strictly
                ></el-input-number>
              </el-form-item>
              <el-form-item
                label-width="18px"
                class="short-item"
                label="Y"
                prop="offsetY"
              >
                <el-input-number
                  v-model="activeComponent.offsetY"
                  :min="0"
                  :max="form.height - activeComponent.height"
                  :step="1"
                  :controls="false"
                  step-strictly
                ></el-input-number>
              </el-form-item>
              <br />
              <el-form-item
                label-width="18px"
                class="short-item"
                label="宽"
                prop="width"
              >
                <el-input-number
                  v-model="activeComponent.width"
                  :min="1"
                  :max="form.width - activeComponent.offsetX"
                  :step="1"
                  :controls="false"
                  step-strictly
                ></el-input-number>
              </el-form-item>
              <el-form-item
                label-width="18px"
                class="short-item"
                label="高"
                prop="height"
                @change="updateTransformer"
              >
                <el-input-number
                  v-model="activeComponent.height"
                  :min="1"
                  :max="form.height - activeComponent.offsetY"
                  :step="1"
                  :controls="false"
                  step-strictly
                  @change="
                    () => {
                      if (activeComponent.typeCode === 'text') {
                        activeComponent.fontSize = Math.min(
                          activeComponent.height,
                          activeComponent.fontSize
                        );
                      }
                    }
                  "
                ></el-input-number>
              </el-form-item>
            </div>
            <template v-if="activeComponent.typeCode === 'image'">
              <el-form-item class="item" label="显示效果">
                <el-select v-model="activeComponent.transition">
                  <el-option
                    :key="op"
                    :value="op"
                    :label="op"
                    v-for="op in [
                      '随机',
                      '马赛克',
                      '上下滚动',
                      '左右滚动',
                      '渐入',
                    ]"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="切换时间">
                <el-input-number
                  v-model="activeComponent.transitionPeriod"
                  :step="1"
                  step-strictly
                  :min="1"
                  :max="1000"
                ></el-input-number
                >秒
              </el-form-item>
              <mat-list
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="10"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'video'">
              <mat-list
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="5"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'url'">
              <el-form-item class="item" label="刷新时间" prop="refreshPeriod">
                <el-time-picker
                  v-model="activeComponent.refreshPeriod"
                  value-format="HH:mm:ss"
                  placeholder="选择刷新时间"
                >
                </el-time-picker>
              </el-form-item>
              <mat-list
                :data="activeComponent.materials"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'html'">
              <mat-list
                :data="activeComponent.materials"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template
              v-else-if="
                activeComponent.typeCode === 'text' ||
                  activeComponent.typeCode.includes('signTxt')
              "
            >
              <el-form-item
                class="item"
                label="背景颜色"
                prop="backgroundColor"
              >
                <el-color-picker v-model="activeComponent.backgroundColor">
                </el-color-picker>
              </el-form-item>
              <el-form-item
                label-width="86px"
                class="item"
                label="背景透明度"
                prop="backgroundOpacity"
              >
                <el-slider
                  v-model="activeComponent.backgroundOpacity"
                ></el-slider>
              </el-form-item>
              <el-form-item
                class="item"
                label="字体颜色"
                prop="backgroundColor"
              >
                <el-color-picker v-model="activeComponent.fontColor">
                </el-color-picker>
              </el-form-item>
              <el-form-item class="item" label="字体大小">
                <el-input-number
                  v-model="activeComponent.fontSize"
                  :step="1"
                  step-strictly
                  :min="1"
                  :max="activeComponent.height"
                ></el-input-number
                >px
              </el-form-item>
              <el-form-item class="item" label="样式">
                <el-select v-model="activeComponent.fontStyle">
                  <el-option
                    :key="key"
                    :value="key"
                    :label="key"
                    v-for="key in ['正常', '加粗', '斜体', '加粗、斜体']"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="滚动速度">
                <el-select v-model="activeComponent.animationSpeed">
                  <el-option
                    :key="key"
                    :value="key"
                    :label="key"
                    v-for="key in ['慢', '中等', '快', '很快']"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="字幕滚动">
                <el-select v-model="activeComponent.animation">
                  <el-option
                    :key="key"
                    :value="key"
                    :label="key"
                    v-for="key in ['从左往右', '从右往左']"
                  ></el-option>
                </el-select>
              </el-form-item>
              <mat-list
                v-if="activeComponent.typeCode === 'text'"
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'weather'">
              <el-form-item class="item" label="城市名称">
                <el-input
                  :maxlength="20"
                  v-model="activeComponent.cityName"
                ></el-input>
              </el-form-item>
              <el-form-item
                class="item"
                label="字体颜色"
                prop="backgroundColor"
              >
                <el-color-picker
                  v-model="activeComponent.fontColor"
                  @change="attachImage(activeComponent)"
                >
                </el-color-picker>
              </el-form-item>
              <el-form-item
                class="item"
                label="背景颜色"
                prop="backgroundColor"
              >
                <el-color-picker
                  v-model="activeComponent.backgroundColor"
                  @change="attachImage(activeComponent)"
                >
                </el-color-picker>
              </el-form-item>
              <h5>样式选择</h5>
              <div>
                <img
                  :class="[
                    'weather-row',
                    activeComponent.style == style.type ? 'active' : '',
                  ]"
                  v-for="style in weatherStyles"
                  :key="style.type + '_' + activeComponent.style"
                  :src="weatherImageUrl(activeComponent.style, style.type)"
                  @click="selectWeatherOrClock(style)"
                />
              </div>
            </template>
            <template v-else-if="activeComponent.typeCode === 'clock'">
              <el-form-item
                class="item"
                label="字体颜色"
                prop="backgroundColor"
              >
                <el-color-picker
                  v-model="activeComponent.fontColor"
                  @change="attachImage(activeComponent)"
                >
                </el-color-picker>
              </el-form-item>

              <el-form-item
                class="item"
                label="背景颜色"
                prop="backgroundColor"
              >
                <el-color-picker
                  v-model="activeComponent.backgroundColor"
                  @change="attachImage(activeComponent)"
                >
                </el-color-picker>
              </el-form-item>
              <h5>样式选择</h5>
              <div>
                <img
                  :class="[
                    'clock-row',
                    activeComponent.style == style.type ? 'active' : '',
                  ]"
                  v-for="style in clockStyles"
                  :key="style.type + '_' + activeComponent.style"
                  :src="clockImageUrl(activeComponent.style, style.type)"
                  @click="selectWeatherOrClock(style)"
                />
              </div>
            </template>
            <template v-else-if="activeComponent.typeCode === 'audio'">
              <mat-list
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'stream'">
              <mat-list
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'facility'">
              <el-form-item class="item" label="设施选择">
                <el-input
                  :value="activeComponent.bindingName"
                  readonly
                  placeholder="请选择"
                  @focus="showSelectFacilities = true"
                >
                </el-input>
              </el-form-item>
              <el-form-item class="item" label="图标主题">
                <el-select v-model="activeComponent.logoTheme">
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in logoThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="箭头主题">
                <el-select v-model="activeComponent.arrowTheme">
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in arrowThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="方向主题">
                <el-select
                  v-model="activeComponent.dirTheme"
                  placeholder="默认8方向"
                >
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in dirThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template v-else-if="activeComponent.typeCode === 'brand'">
              <el-form-item class="item" label="品牌选择">
                <el-input
                  :value="activeComponent.bindingName"
                  readonly
                  placeholder="请选择"
                  @focus="
                    showSelectBrands = true;
                    getBrands();
                  "
                >
                </el-input>
              </el-form-item>
              <el-form-item class="item" label="箭头主题">
                <el-select v-model="activeComponent.arrowTheme">
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in arrowThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="方向主题">
                <el-select
                  v-model="activeComponent.dirTheme"
                  placeholder="默认8方向"
                >
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in dirThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template v-else-if="activeComponent.typeCode === 'position'">
              <el-form-item class="item" label="地图选点">
                <el-select v-model="activeComponent.bindingCode">
                  <el-option
                    :key="key"
                    :value="key"
                    :label="key"
                    v-for="key in []"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="箭头主题">
                <el-select v-model="activeComponent.arrowTheme">
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in arrowThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="item" label="方向主题">
                <el-select
                  v-model="activeComponent.dirTheme"
                  placeholder="默认8方向"
                >
                  <el-option
                    :key="theme.code"
                    :value="theme.code"
                    :label="theme.name"
                    v-for="theme in dirThemes"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </template>
        </div>
      </el-form>
    </div>
    <el-dialog
      class="md"
      :title="materialDialogTitle"
      :visible.sync="showSelectMaterial"
      append-to-body
    >
      <el-row>
        <el-col :span="12"
          ><el-input
            v-model="q"
            placeholder="请输入名称进行查询"
            suffix-icon="el-icon-search"
            @blur="getMaterials"
            @keyup.enter.native="getMaterials"
          ></el-input
        ></el-col>
        <el-col :span="12"></el-col>
      </el-row>
      <ul class="res-dialog-list">
        <li
          v-for="material in materials"
          :key="material.code"
          @click.prevent="showSelectMaterial && addMaterial(material)"
        >
          <div class="item">
            <img
              v-if="currentMaterialType === 'video'"
              :src="material.previewPath"
              alt=""
            />
            <img
              v-else-if="currentMaterialType === 'image'"
              :src="material.fileUrl"
              alt=""
            />
            <svg v-else-if="activeComponent" class="icon" aria-hidden="true">
              <use :xlink:href="logos[activeComponent.typeCode]"></use>
            </svg>

            <p v-if="material.resolution" class="meta">
              {{ material.resolution }}
            </p>
          </div>
          <p>{{ material.name }}</p>
          <span class="li-hover"></span>
        </li>
      </ul>
      <el-pagination
        align="center"
        layout="prev, pager, next"
        :current-page.sync="pageIndex"
        @current-change="getMaterials"
        :total="total"
      >
      </el-pagination>
    </el-dialog>
    <el-dialog
      :title="previewMaterial && previewMaterial.name"
      append-to-body
      :visible.sync="showMaterialPreview"
    >
      <template v-if="previewMaterial">
        <el-alert
          v-if="currentMaterialType === 'video'"
          :closable="false"
          type="info"
        >
          <div slot="title">
            如视频无法播放可点击下载
            <a :href="previewMaterial.fileUrl" target="_blank" download>下载</a>
          </div>
        </el-alert>
        <video
          v-if="currentMaterialType === 'video'"
          style="width:100%;min-height:500px;"
          controls
          :src="previewMaterial.fileUrl"
        ></video>
        <img
          v-else-if="currentMaterialType === 'image'"
          style="width:100%;min-height:500px;"
          :src="previewMaterial.fileUrl"
        />
        <audio
          v-else-if="currentMaterialType === 'audio'"
          controls
          :src="previewMaterial.fileUrl"
        ></audio>
        <object
          v-else
          style="width:100%;min-height:500px;"
          :data="previewMaterial.fileUrl"
        ></object>
      </template>
    </el-dialog>
    <el-dialog
      append-to-body
      :visible.sync="showSelectFacilities"
      title="设施列表"
    >
      <el-input
        placeholder="搜索设施名称"
        v-model="facilityQ"
        suffix-icon="el-icon-search"
        style="margin-bottom: 40px;"
        clearable
      ></el-input>
      <el-button
        plain
        v-for="facility in facilities.filter(({ name }) =>
          name.includes(facilityQ)
        )"
        :key="facility.code"
        @click="
          activeComponent.bindingCode = facility.code;
          activeComponent.bindingName = facility.name;
          facilityQ = '';
          showSelectFacilities = false;
        "
        >{{ facility.name }}</el-button
      >
    </el-dialog>
    <el-dialog append-to-body :visible.sync="showSelectBrands" title="品牌列表">
      <el-input
        placeholder="搜索品牌名称"
        v-model="brandQ"
        suffix-icon="el-icon-search"
        style="margin-bottom: 40px;"
        clearable
        @input="getBrands"
      ></el-input>
      <el-tabs v-model="brandTab">
        <el-tab-pane
          v-for="floor in brandsGroupByFloor"
          :key="floor.floorName"
          :label="floor.floorName"
          :name="floor.floorName"
        >
          <el-button
            plain
            v-for="brand in floor.list"
            :key="brand.code"
            @click="
              activeComponent.bindingCode = brand.code;
              activeComponent.bindingName = brand.name;
              brandQ = '';
              brandTab = '';
              showSelectBrands = false;
            "
            >{{ brand.name }}</el-button
          ></el-tab-pane
        >
      </el-tabs>
    </el-dialog>
    <el-dialog
      fullscreen
      append-to-body
      :program="form"
      class="preview-program"
      :visible.sync="showPreview"
    >
      <preview-program
        :key="previewKey"
        @refresh="(key) => (previewKey = key)"
        @close="
          showPreview = false;
          previewKey = null;
        "
        v-if="showPreview"
        :program="form"
      ></preview-program>
    </el-dialog>
  </div>
</template>

<script>
import MatList from "./EditForm/MatList";
import { ProgramApi } from "../program.js";
import ComponentList from "./EditForm/ComponentList";
import { svgs } from "./EditForm/svgs.js";
import BackgroundColor from "./EditForm/KonvaComponents/BackgroundColor";
import BackgroundImage from "./EditForm/KonvaComponents/BackgroundImage";
import ContainerRect from "./EditForm/KonvaComponents/ContainerRect";
import InnerImage from "./EditForm/KonvaComponents/InnerImage";
import ImageComponent from "./EditForm/KonvaComponents/ImageComponent";
import InnerText from "./EditForm/KonvaComponents/InnerText";
import PreviewProgram from "./PreviewProgram";
import createComponent, {
  weatherStyles,
  clockStyles,
  componentSubMap,
  typeCodeClassMap,
} from "./Component.js";
import defaultBrand from "./defaultBrand.svg";
import defaultFac from "./defaultFac.svg";
import defaultArrow from "./defaultArrow.svg";

const logos = {
  audio: "#iconyinpin",
  clock: "#iconshijian",
  html: "#iconHTML",
  image: "#icontupian",
  stream: "#iconliumeiti",
  text: "#iconwendang",
  url: "#iconlianjie",
  video: "#iconshipin",
  weather: "#icontianqi-1",
  facility: "#iconsheshi",
  brand: "#iconpinpai",
  position: "#icondianwei",
};
const componentKeys = [
  "code",
  "addTime",
  "typeCode",
  "zIndex",
  "width",
  "height",
  "offsetX",
  "offsetY",
  "materials",
  "bindingCode",
  "bindingName",
  "subComponents",
];
const toObj = (acc, [k, v]) => ({ ...acc, [k]: v });
const flatenComponent = ({ config, subComponents, ...component }) => {
  let result = !config ? { ...component } : { ...component, ...config };
  if (subComponents) {
    result.subComponents = Object.entries(subComponents)
      .map(([k, component]) => [k, flatenComponent(component)])
      .reduce(toObj, {});
  }
  return result;
};
const seperateConfig = (component) =>
  Object.entries(component).reduce(
    (acc, [k, v]) =>
      componentKeys.includes(k)
        ? k === "subComponents"
          ? {
              ...acc,
              [k]: Object.entries(v)
                .map(([kk, vv]) => [kk, seperateConfig(vv)])
                .reduce(toObj, {}),
            }
          : { ...acc, [k]: v }
        : { ...acc, config: { ...acc.config, [k]: v } },
    { config: {} }
  );

export default {
  components: {
    MatList,
    ComponentList,
    PreviewProgram,
    BackgroundColor,
    BackgroundImage,
    ContainerRect,
    InnerImage,
    ImageComponent,
    InnerText,
  },
  props: ["showEditForm", "code"],
  data() {
    return {
      form: null,
      activeComponent: null,
      rules: {
        duration: [
          { required: true, message: "请选择节目时长", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value === "00:00:00") callback(new Error("节目时长不能为0"));
              return;
            },
          },
        ],
      },
      activeComponent: null,
      presetLine: [
        { type: "l", site: 100 },
        { type: "v", site: 200 },
      ],
      colors: [
        "#cf8592",
        "#b285be",
        "#93a1c6",
        "#6aa18a",
        "#78adb5",
        "#aec889",
        "#bc9c63",
        "#ee9962",
        "#c9c272",
        "#949494",
        "#b2b2b2",
        "#d6d6d6",
        "#93867d",
        "#b3aaa3",
        "#dad5d2",
      ],
      componentTypeOrder: [
        "video",
        "image",
        "text",
        "html",
        "weather",
        "clock",
        "url",
        "audio",
        "stream",
        "facility",
        "brand",
        "position",
      ],
      componentTypeTip: {
        video: "一个节目只能由2个视频控件。",
        image: "一个节目只能有4个图片控件。",
        audio: "一个节目只能有一个音频控件，音频和流媒体不能共存。",
        stream: "一个节目音频和流媒体不能共存。",
      },
      weatherStyles,
      clockStyles,
      colorIndex: 0,
      logos,
      componentTypes: {},
      subComponentTypes: {},
      componentSubMap,
      ...{
        showSelectMaterial: false,
        materials: [],
        q: "",
        pageIndex: 1,
        total: 0,
        showMaterialPreview: false,
        previewMaterial: null,
      },
      selectedShapeName: "",
      backgroundImage: null,
      Image,
      showPreview: false,
      previewKey: null,
      logoThemes: [],
      arrowThemes: [],
      dirThemes: [
        { code: 8, name: "八方向" },
        { code: 12, name: "十二方向" },
      ],
      ...{ showSelectFacilities: false, facilityQ: "", facilities: [] },
      ...{
        showSelectBrands: false,
        brandQ: "",
        brandsGroupByFloor: [],
        brandTab: "",
      },
    };
  },
  computed: {
    isSignComponentActive() {
      return !this.activeComponent
        ? false
        : this.activeComponent.typeCode === "facility" ||
            this.activeComponent.typeCode === "brand" ||
            this.activeComponent.typeCode === "position";
    },
    stageScale() {
      if (!this.form) return 0;
      return Math.min(
        (this.$root.ww - 752 - 240) / this.form.width,
        (this.$root.wh - 80 - 120) / this.form.height
      );
    },
    materialDialogTitle() {
      return !this.form
        ? ""
        : !this.activeComponent
        ? `背景选择 ${this.form.width}*${this.form.height}`
        : `${this.componentTypes[this.activeComponent.typeCode]}选择 ${
            this.activeComponent.width
          }*${this.activeComponent.height}`;
    },
    currentMaterialType() {
      return this.activeComponent ? this.activeComponent.typeCode : "image";
    },
  },
  methods: {
    async getBrands() {
      this.brandsGroupByFloor = await ProgramApi.getBrands(this.brandQ);
      this.brandTab = this.brandsGroupByFloor[0]
        ? this.brandsGroupByFloor[0].floorName
        : "";
    },
    attachImage(component, parent) {
      if (
        component &&
        (component.typeCode === "image" || component.typeCode === "video")
      ) {
        if (component.materials && component.materials.length) {
          const image = new Image();
          image.id = new Date().getTime();
          const last = component.materials[component.materials.length - 1];
          image.onload = () => {
            component.image = image;
            this.setComponents();
          };
          image.src =
            last[component.typeCode === "video" ? "previewPath" : "fileUrl"];
        } else {
          delete component.image;
        }
      }
      if (
        component &&
        (component.typeCode === "weather" || component.typeCode === "clock")
      ) {
        const image = new Image();
        image.id = new Date().getTime();
        const url = svgs({
          type: component.typeCode,
          style: component.style || 0,
          backgroundColor: component.backgroundColor,
          color: component.fontColor,
        });
        image.onload = () => {
          component.image = image;
          this.setComponents();
        };
        image.src = url;
      }
      if (component && component.typeCode === "signImage_logo") {
        const image = new Image();
        image.id = new Date().getTime();
        image.onload = () => {
          component.image = image;
          this.setComponents();
        };
        image.src = parent.typeCode === "brand" ? defaultBrand : defaultFac;
      }
      if (component && component.typeCode === "signImage_direction") {
        const image = new Image();
        image.id = new Date().getTime();
        image.onload = () => {
          component.image = image;
          this.setComponents();
        };
        image.src = defaultArrow;
      }
    },
    selectWeatherOrClock(style) {
      this.activeComponent.style = style.type;
      this.activeComponent.width =
        (this.activeComponent.height / style.height) * style.width;
      this.attachImage(this.activeComponent);
      this.updateTransformer();
    },
    weatherImageUrl(activeStyle, style) {
      return svgs({
        type: "weather",
        style,
        backgroundColor: activeStyle == style ? "#2F6BFF" : "",
        color: activeStyle == style ? "#FFFFFF" : "#868F9F",
      });
    },
    clockImageUrl(activeStyle, style) {
      return svgs({
        type: "clock",
        style,
        backgroundColor: activeStyle == style ? "#2F6BFF" : "",
        color: activeStyle == style ? "#FFFFFF" : "#868F9F",
      });
    },
    addMaterial(material) {
      this.showSelectMaterial = false;
      if (!this.activeComponent) this.form.backgroundMaterial = material;
      else this.activeComponent.materials.push(material);
      this.attachImage(this.activeComponent);
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;

      const selectedNode = stage.findOne("." + selectedShapeName);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
      transformerNode.getLayer().batchDraw();
    },
    transformBoundBoxFunc(oldBox, newBox) {
      if (
        newBox.x < 0 ||
        newBox.y < 0 ||
        newBox.x + newBox.width > this.form.width ||
        newBox.y + newBox.height > this.form.height
      )
        return oldBox;
      return newBox;
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      const component = this.getComponentByName(name);
      if (component) {
        this.activeComponent = component;
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = "";
      }
      this.updateTransformer();
    },
    getComponentByName(name) {
      const nameArr = name.split("*");
      const component = !name.startsWith("name*")
        ? null
        : nameArr.length === 3
        ? this.form.components[nameArr[1]].subComponents[nameArr[2]]
        : this.form.components[nameArr[1]];
      return component;
    },
    handleTransformEnd({ target }) {
      const {
        attrs: { x, y, scaleX, scaleY, name },
      } = target;
      const component = this.getComponentByName(name);
      let newWidth = component.width * scaleX;

      let newHeight = component.height * scaleY;

      Object.assign(component, {
        width: Math.floor(newWidth),
        height: Math.floor(newHeight),
        offsetX: Math.floor(x),
        offsetY: Math.floor(y),
      });
      target.scaleX(1);
      target.scaleY(1);
      if (component.typeCode === "text")
        component.fontSize = Math.min(component.height, component.fontSize);
      this.setComponents();
    },
    handleDragend({
      target: {
        attrs: { name, x, y },
      },
    }) {
      const component = this.getComponentByName(name);
      if (!component) return;
      Object.assign(component, {
        offsetX: Math.floor(x),
        offsetY: Math.floor(y),
      });
      this.setComponents();
    },
    setComponents() {
      this.form.components.forEach(
        (component, i) => (component.zIndex = i + 1)
      );
      this.form = {
        ...this.form,
      };
    },
    setActiveComponent(i) {
      this.activeComponent = this.form.components[i];
      this.selectedShapeName = "name*" + i;
      this.updateTransformer();
    },
    setActiveSubComponent({ i, typeCode }) {
      this.activeComponent = this.form.components[i].subComponents[typeCode];
      this.selectedShapeName = "name*" + i + "*" + typeCode;
      this.updateTransformer();
    },
    appendComponent(typeCode) {
      if (!this.form.components) this.form.components = [];
      if (this.form.components.length >= 16)
        return this.$message({
          type: "warning",
          message: "最多添加16个控件。",
        });
      switch (typeCode) {
        case "image":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "image")
              .length >= 4
          )
            return this.$message({
              type: "warning",
              message: "一个节目只能有4个图片控件。",
            });
          break;
        case "video":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "video")
              .length >= 2
          )
            return this.$message({
              type: "warning",
              message: "一个节目只能由2个视频控件。",
            });
          break;
        case "audio":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "audio")
              .length >= 1
          )
            return this.$message({
              type: "warning",
              message: "一个节目只能有一个音频控件。",
            });
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "stream")
              .length >= 1
          )
            return this.$message({
              type: "warning",
              message: "一个节目音频和流媒体不能共存。",
            });
          break;
        case "stream":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "audio")
              .length >= 1
          )
            return this.$message({
              type: "warning",
              message: "一个节目音频和流媒体不能共存。",
            });
          break;
        default:
          break;
      }
      const component = createComponent({
        typeCode,
        zIndex: this.form.components.length,
        color: this.colors[this.colorIndex],
      });
      this.colorIndex++;
      if (this.colorIndex === this.colors.length) this.colorIndex = 0;
      this.activeComponent = component;
      this.form.components.push(component);
      this.attachImage(component);
      component.subComponents &&
        Object.values(component.subComponents).forEach((subComponent) =>
          this.attachImage(subComponent, component)
        );
      this.form = {
        ...this.form,
      };
      this.$nextTick(() => {
        this.selectedShapeName = "name*" + (this.form.components.length - 1);
        this.updateTransformer();
      });
    },
    removeComponent(i) {
      this.$confirm("您确认要删除该组件?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.form.components.splice(i, 1);
        this.activeComponent = null;
        this.selectedShapeName = "";
        this.updateTransformer();
        this.setComponents();
      });
    },
    toggleSubComponent({ i, typeCode }) {
      if (this.form.components[i].subComponents[typeCode]) {
        delete this.form.components[i].subComponents[typeCode];
        this.activeComponent = null;
        this.selectedShapeName = "";
      } else {
        const zIndex = i;
        const color = this.form.components[i].color;
        const subComponent = new typeCodeClassMap[typeCode]({
          typeCode,
          zIndex,
          color,
        });
        this.form.components[i].subComponents[typeCode] = subComponent;
        this.activeComponent = subComponent;
        this.selectedShapeName = "name*" + i + "*" + typeCode;
      }
      this.updateTransformer();
      this.setComponents();
    },
    async submit() {
      if (this.form.duration === "00:00:00")
        return this.$message({ type: "error", message: "节目时长不能为0" });
      const {
        duration,
        backgroundColor,
        backgroundMaterial,
        components,
      } = this.form;

      const { code, msg } = await ProgramApi.put({
        programCode: this.form.code,
        duration,
        backgroundColor,
        backgroundMaterial: backgroundMaterial ? backgroundMaterial.code : null,
        components: components
          ? components
              .map(({ color, image, ...component }) => component)
              .map(seperateConfig)
              .map((component, i) => ({
                ...component,
                materials: component.materials.map(({ code }) => code),
                zIndex: i,
              }))
          : [],
      });
      if (code === "200") {
        this.$message({ type: "success", message: msg });
        this.$emit("saved");
      } else this.$message({ type: "error", message: msg });
    },
    reset() {
      this.form = null;
      this.activeComponent = null;
      this.selectedShapeName = "";
      this.colorIndex = 0;
    },
    async init() {
      this.reset();
      const { data, code, msg } = await ProgramApi.getDetail({
        code: this.code,
      });
      if (code === "200") {
        this.form = data;
        if (this.form.backgroundMaterial) {
          this.form.backgroundMaterial = {
            name: this.form.backgroundMaterialName,
            code: this.form.backgroundMaterial,
            fileUrl: this.form.backgroundMaterialUrl,
          };
        }
        if (!this.form.components) this.form.components = [];
        this.form.components = this.form.components.map(flatenComponent);
        this.form.components.forEach((component) => {
          component.color = this.colors[this.colorIndex];
          this.attachImage(component);
          this.colorIndex++;
        });
      } else {
        this.$message({ type: "error", message: msg });
      }
    },
    async openMaterialModal() {
      await this.getMaterials();
      this.showSelectMaterial = true;
    },
    async getMaterials() {
      const { pageIndex, currentMaterialType, q } = this;
      const { data, code, msg } = await ProgramApi.getMaterials({
        typeCode: currentMaterialType,
        name: q,
        paging: 1,
        pageIndex,
        pageSize: 8,
      });
      if (code === "200") {
        const { list, allCount } = data;
        this.materials = list;
        this.total = allCount;
      } else this.$message({ type: "error", message: msg });
    },
    previewMat(material) {
      this.previewMaterial = material;
      this.showMaterialPreview = true;
    },
    removeMaterial(i) {
      this.activeComponent.materials.splice(i, 1);
      this.attachImage(this.activeComponent);
    },
    swap(i, j) {
      const tmp = this.activeComponent.materials[i];
      this.activeComponent.materials[i] = this.activeComponent.materials[j];
      this.activeComponent.materials[j] = tmp;
      this.activeComponent.materials = [...this.activeComponent.materials];
      this.attachImage(this.activeComponent);
    },
    preview() {
      this.showPreview = true;
    },
  },
  watch: {
    showEditForm(val) {
      if (val) {
        this.init();
      } else {
        this.form = null;
      }
    },
    "form.backgroundMaterial"(val) {
      if (!val) this.backgroundImage = null;
      else if (val.fileUrl) {
        const image = new Image();
        image.src = val.fileUrl;
        image.onload = () => {
          this.backgroundImage = image;
        };
      }
    },
  },
  async mounted() {
    const [
      componentTypes,
      subComponentTypes,
      facilities,
      logoThemes,
      arrowThemes,
    ] = await Promise.all([
      ProgramApi.getComponentTypes(),
      ProgramApi.getSubComponentTypes(),
      ProgramApi.getFacilities(),
      ProgramApi.getLogoThemes(),
      ProgramApi.getArrowThemes(),
    ]);
    Object.assign(this, {
      componentTypes,
      subComponentTypes,
      facilities,
      logoThemes,
      arrowThemes,
    });
    this.init();
  },
};
</script>

<style scoped lang="scss">
.pef {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .header {
    background: #ffffff;
    height: 80px;
    flex: 0 0 80px;
    line-height: 80px;
    border-bottom: 1px solid #e6e7ec;
    .left {
      position: relative;
      padding-left: 80px;
      flex: 0 0 256px;
      font-family: Source Han Sans CN;
      font-style: normal;
      font-weight: bold;
      font-size: 18px;
      color: #868f9f;
      border-right: 1px solid #e6e7ec;
      svg {
        position: absolute;
        left: 24px;
        top: 24px;
        font-size: 32px;
        color: #2f6bff;
      }
    }
    .middle {
      padding-left: 64px;
      .meta1 {
        font-family: Source Han Sans CN;
        font-style: normal;
        font-weight: bold;
        font-size: 12px;
        color: #868f9f;
        margin-right: 16px;
      }
      .input1 {
        height: 44px;
        width: 200px;
        margin-right: 32px;
        padding-left: 12px;
        color: #3a4763;
        font-weight: bold;
        font-size: 14px;
        background: #f6f6f6;
        border: 1px solid #e6eaf0;
        box-sizing: border-box;
        border-radius: 8px;
      }
    }
    .right {
      flex: 0 0 400px;
      display: flex;
      padding: 18px 64px 18px 0;
      .btn {
        vertical-align: middle;
        text-align: left;
        position: relative;
        display: inline-block;
        width: 88px;
        height: 44px;
        line-height: 44px;
        padding-left: 44px;
        border: 1px solid #e6eaf0;
        border-radius: 8px;
        color: #868f9f;
        cursor: pointer;
        svg {
          position: absolute;
          top: 12.5px;
          left: 16px;
          font-weight: bold;
          font-size: 20px;
        }
        &.success,
        &.primary {
          border: none;
          color: #fff;
        }
        &.success {
          background: #12b362;
        }
        &.primary {
          background: #2f6bff;
        }
      }
      .btn + .btn {
        margin-left: 8px;
      }
    }
  }
  .main {
    flex: 1;
    display: flex;
    .left {
      flex: 0 0 256px;
      background: #fff;
      text-align: center;
      padding-top: 8px;
      user-select: none;
      .btn {
        position: relative;
        text-align: left;
        padding-left: 60px;
        width: 240px;
        color: #868f9f;
        border-radius: 8px;
        margin: auto;
        font-size: 14px;
        line-height: 56px;
        height: 56px;
        cursor: pointer;
        &:active {
          background: #2f6bff;
          color: #fff;
        }
        .icon {
          position: absolute;
          font-size: 20px;
          top: 18px;
          left: 16px;
        }
      }
    }
    .middle {
      flex: 1;
      height: calc(100vh - 80px);
      position: relative;
      background: #ececec;
    }
    .right {
      flex: 0 0 496px;
      overflow-x: hidden;
      height: calc(100vh - 80px);
      display: flex;
      overflow: hidden;
      .r1 {
        flex: 0 0 188px;
        .component-item {
          position: relative;
          display: flex;
          margin: 0 12px;
          padding-left: 48px;
          padding-right: 12px;
          font-size: 14px;
          line-height: 45px;
          height: 45px;
          justify-content: space-between;
          cursor: pointer;
          color: #868f9f;
          border-radius: 6px;
          white-space: nowrap;
          .icon-avatar {
            position: absolute;
            font-size: 20px;
            top: 13px;
            left: 12px;
          }
          .btn {
            font-size: 20px;
            &.hidden {
              visibility: hidden;
              cursor: none;
            }
          }
          .btn + .btn {
            margin-left: 8px;
          }
          &.selected {
            background: #2f6bff;
            color: #fff;
          }
        }
      }
      .r2 {
        flex: 0 0 308px;
        width: 308px;
        border-left: 1px solid #e6e7ec;
        overflow-x: hidden;
        overflow-y: auto;
        .weather-row {
          height: 46px;
          margin-left: 11px;
          &.active {
            border-radius: 6px;
          }
        }
        .weather-row + .weather-row {
          margin-top: 16px;
        }
        .clock-row {
          height: 62px;
          margin-left: 10px;
          &.active {
            border-radius: 6px;
          }
        }
      }
      h5 {
        display: flex;
        justify-content: space-between;
        margin-top: -1px;
        font-weight: bold;
        font-size: 18px;
        line-height: 27px;
        padding-top: 24px;
        padding-left: 24px;
        padding-right: 12px;
        padding-bottom: 12px;
        color: #3a4763;
        border-top: 1px solid #e6e7ec;
      }
      .item {
        input {
          width: 200px;
          height: 44px;
          background: #ffffff;
          border: 1px solid #e6eaf0;
          box-sizing: border-box;
          border-radius: 6px;
        }
      }

      .mat {
        display: flex;
        justify-content: space-between;
        padding: 0 12px;
        width: 376px;
        line-height: 45px;
        height: 45px;
        margin-left: 12px;
        border-radius: 6px;
        font-size: 14px;
        color: #868f9f;
        .icon {
          font-size: 20px;
        }
        .icon + .icon {
          margin-left: 16px;
        }
        &:active {
          background: #f2f5fa;
        }
      }
      .short-item {
        display: inline-block;
        line-height: 32px;
        width: 84px;
        .el-input-number {
          width: 68px;
          font-weight: bold;
          font-size: 14px;
          color: #3a4763;
        }
      }
      .short-item + .short-item {
        margin-left: 16px;
      }
    }
  }

  .prefix {
    margin-right: 10px;
  }
  .edit .el-dialog {
    width: 100%;
    height: 100%;
  }

  .updown {
    width: 30px;
  }
  .stage {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    transform-origin: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cube {
    position: absolute;
    display: block;
    width: 14px;
    height: 14px;
    left: 5px;
    top: 7px;
  }
  .pos-items {
    position: relative;
    padding-top: 7px;
    padding-left: 78px;
  }
  .pos-items::before {
    content: "位置";
    position: absolute;
    font-size: 14px;
    color: #868f9f;
    line-height: 21px;
    top: 16px;
    left: 24px;
  }

  .logo {
    width: 57px;
    height: 57px;
  }
}
.res-dialog-list {
  overflow: hidden;
  margin-top: 10px;
  border: 1px solid #ddd;
}
.res-dialog-list li {
  float: left;
  position: relative;
  margin: 5px 10px;
  width: 120px;
  height: 140px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}
.res-dialog-list li .item {
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.res-dialog-list li:hover .li-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(24, 144, 255, 1);
}
.res-dialog-list li img {
  max-width: 100%;
  max-height: 100%;
}
.res-dialog-list li object {
  max-width: 100%;
  max-height: 100%;
}
.res-dialog-list li svg {
  font-size: 80px;
}
.res-dialog-list li p {
  margin: 0;
  padding: 0;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-align: center;
}
.res-dialog-list li p.meta {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 30px;
  line-height: 30px;
  color: rgb(255, 255, 255);
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}
</style>
<style lang="scss">
.preview-program {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    width: 100%;
    height: 100%;
    padding: 0;
    background: #ececec;
  }
}

.konvajs-content {
  flex-shrink: 0;
  border: 1px solid #ddd;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 30%);
  border: 1px solid rgba(221, 221, 221, 1);
}
.md .el-dialog {
  min-width: 610px;
  max-width: 610px;
}
.pef {
  .item {
    padding-left: 24px;
    line-height: 44px;
    > .el-form-item__label {
      font-size: 14px;
      color: #868f9f;
    }
    .el-input-number {
      line-height: 44px;
      max-width: 160px;
      input {
        max-width: 160px;
      }
    }
    input {
      max-width: 180px;
      border: 1px solid #e6eaf0;
      box-sizing: border-box;
      border-radius: 6px;
      font-weight: bold;
      color: #3a4763;
      height: 44px;
      font-size: 12px;
      line-height: 44px;
    }
    .el-slider__runway {
      width: 180px;
    }
    &.is-required {
      > .el-form-item__label {
        &::before {
          content: "";
        }
      }
    }
  }
  .short-item {
    label {
      padding: 0;
      font-size: 14px;
      color: #868f9f;
      text-align: left;
    }
    .el-input {
      input {
        font-weight: bold;
        font-size: 14px;
        color: #3a4763;
        height: 32px;
        line-height: 32px;
        border: 1px solid #e6eaf0;
        box-sizing: border-box;
        border-radius: 6px;
      }
    }
  }
}
</style>
