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
        <el-dropdown
          @command="setScale"
          class="input1"
          style="margin-right:8px;display: inline-flex;width: 65px;align-content: center;align-items: center;user-select:none"
        >
          <span class="el-dropdown-link">
            {{ (stageScale * 100).toFixed(0) + "%"
            }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="initScale">
              {{ (initScale * 100).toFixed(0) + "%" }}</el-dropdown-item
            >
            <el-dropdown-item :command="1">100%</el-dropdown-item>
            <el-dropdown-item :command="1.5">150%</el-dropdown-item>
            <el-dropdown-item :command="2">200%</el-dropdown-item>
            <el-dropdown-item :command="3">300%</el-dropdown-item>
            <el-dropdown-item :command="4">400%</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
            placement="top"
            title="提示"
            trigger="focus"
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
      <div class="middle canvas-wrapper" @wheel="handleWheel">
        <div
          class="scroll-dummy"
          :style="
            `width: ${form.width * stageScale}px;height: ${form.height *
              stageScale}px;`
          "
        ></div>
        <v-stage
          class="stage"
          :style="
            `width: ${form.width}px;height: ${form.height}px;transform: scale(${stageScale})`
          "
          :config="{
            width: form.width,
            height: form.height,
          }"
          ref="stage"
          @mousedown="handleStageMouseDown"
          @mousemove="handleStageMouseMove"
          @mouseup="handleStageMouseUp"
          @mouseleave="handleStageMouseUp"
        >
          <v-layer
            @dragmove="handleDragMove"
            @dragend="handleDragEnd"
            ref="layer"
          >
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
            <v-rect
              v-if="downPos && rectSelectConfig"
              name="rect-select"
              :config="rectSelectConfig"
            ></v-rect>
            <v-rect
              v-if="selectedComponentsGroupConfig"
              name="selected-group"
              :config="selectedComponentsGroupConfig"
              @dragend="handleSelectedGroupDrag"
            ></v-rect>
          </v-layer>
        </v-stage>
      </div>

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
          <h5>对齐分布</h5>
          <aligns
            :active="selectedComponentsGroupConfig"
            @set="handleAlignSet"
          ></aligns>
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
                :limit="50"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'video'">
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
                :limit="50"
                @selectMat="openMaterialModal"
              ></mat-list>
            </template>
            <template v-else-if="activeComponent.typeCode === 'svga'">
              <mat-list
                :data="activeComponent.materials"
                @swap="([i, j]) => swap(i, j)"
                @preview="previewMat"
                @remove="removeMaterial"
                :limit="1"
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
            <template
              v-else-if="
                activeComponent.typeCode === 'text' ||
                  (activeComponent.typeCode &&
                    activeComponent.typeCode.includes('signTxt'))
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
              <el-form-item class="item" label="字体">
                <el-select v-model="activeComponent.fontFamily">
                  <el-option
                    :key="key"
                    :value="key"
                    :label="key"
                    v-for="key in [
                      '思源黑体Bold',
                      '思源黑体Heavy',
                      '思源黑体Light',
                      '思源黑体Medium',
                      '思源黑体Normal',
                      '思源黑体Regular',
                    ]"
                  ></el-option>
                </el-select>
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
                    v-for="key in ['自动', '固定', '从左往右']"
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
                <el-button
                  @click="showSelectNavPoint(activeComponent.bindingCode)"
                >
                  {{ activeComponent.bindingCode || "请选择" }}</el-button
                >
                <el-button
                  v-if="activeComponent.bindingCode"
                  type="danger"
                  icon="el-icon-delete"
                  plain
                  @click="activeComponent.bindingCode = null"
                ></el-button>
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
              v-if="material.typeCode === '视频'"
              :src="material.previewPath"
              alt=""
            />
            <img
              v-else-if="material.typeCode === '图片'"
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
        :page-size="8"
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
          v-if="previewMaterial.typeCode === '视频'"
          style="width:100%;min-height:500px;object-fit:contain;"
          controls
          :src="previewMaterial.fileUrl"
        ></video>
        <svga
          v-else-if="previewMaterial.typeCode === 'svga'"
          style="width:100%;min-height:500px;object-fit:contain;"
          :src="previewMaterial.fileUrl"
        ></svga>
        <img
          v-else-if="previewMaterial.typeCode === '图片'"
          style="width:100%;min-height:500px;object-fit:contain;"
          :src="previewMaterial.fileUrl"
        />
        <audio
          v-else-if="previewMaterial.typeCode === '音频'"
          controls
          :src="previewMaterial.fileUrl"
        ></audio>
        <object
          v-else
          style="width:100%;min-height:500px;object-fit:contain;"
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
        :program="previewForm"
      ></preview-program>
    </el-dialog>
    <el-dialog append-to-body :visible.sync="isSelectNavPointShown">
      <el-form inline>
        <el-form-item label="楼栋/楼层">
          <el-cascader
            :value="currentBF"
            :options="bf"
            @change="handleCurrentBfChange"
            :props="{ value: 'order', label: 'name', children: 'floors' }"
          ></el-cascader
        ></el-form-item>
        <el-form-item label="点位">
          <el-input :value="navPointBindingCode" readonly></el-input
        ></el-form-item>
        <el-form-item
          ><el-button
            type="primary"
            @click="
              activeComponent.bindingCode = navPointBindingCode;
              isSelectNavPointShown = false;
            "
            :disabled="!navPointBindingCode"
            >确定</el-button
          ></el-form-item
        >
      </el-form>

      <div v-if="isSelectNavPointShown" id="threeDiv"></div>
    </el-dialog>
    <el-dialog append-to-body :visible.sync="isSelectPreviewDevice" width="80%">
      <el-form inline>
        <el-form-item label="楼栋/楼层">
          <el-cascader
            :value="currentBF"
            :options="bf"
            @change="handleCurrentBfChange"
            :props="{ value: 'order', label: 'name', children: 'floors' }"
          ></el-cascader
        ></el-form-item>
        <el-form-item label="设备">
          <el-input :value="deviceName" readonly></el-input
        ></el-form-item>
        <el-form-item
          ><el-button
            type="primary"
            @click="submitDevice(deviceCode)"
            :disabled="!deviceCode"
            >确定</el-button
          ></el-form-item
        >
      </el-form>
      <el-row>
        <el-col :span="18">
          <div v-if="isSelectPreviewDevice" id="threeDiv"></div>
        </el-col>
        <el-col :span="6">
          <el-card v-if="device">
            <div slot="header" class="clearfix">
              <span>设备详情</span>
            </div>
            <el-form disabled>
              <el-form-item label="设备名">
                <el-input :value="device.devNum"></el-input>
              </el-form-item>
              <el-form-item label="IP">
                <el-input :value="device.ip"></el-input>
              </el-form-item>
              <!-- <el-form-item label="所在编组">
                <el-input
                  :value="device.groupList.map(({ sname }) => sname).join(' ')"
                ></el-input>
              </el-form-item> -->
              <el-form-item label="状态">
                <el-input
                  :value="device.deviceOnline ? '在线' : '离线'"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
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
import { mapGetters } from "vuex";
import { GuideLineHelper } from "./EditForm/GuideLineHelper";
import Aligns from "./EditForm/Aligns";
import svga from "../svga.vue";

const logos = {
  audio: "#iconyinpin",
  clock: "#iconshijian",
  svga: "#iconshipin",
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
const limits = {
  total: 16,
  image: 16,
  video: 2,
  audio: 1,
};

const flatenComponent = ({ config, subComponents, ...component }) => {
  let result = !config ? { ...component } : { ...component, ...config };
  if (subComponents) {
    result.subComponents = subComponents
      .map(flatenComponent)
      .reduce(
        (acc, component) => ({ ...acc, [component.typeCode]: component }),
        {}
      );
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
              [k]: Object.values(v).map(seperateConfig),
            }
          : { ...acc, [k]: v }
        : { ...acc, config: { ...acc.config, [k]: v } },
    { config: {} }
  );
const scaleBy = 1.01;
const haveIntersection = (r1, r2) => {
  return !(
    r2.x > r1.offsetX + r1.width ||
    r2.x + r2.width < r1.offsetX ||
    r2.y > r1.offsetY + r1.height ||
    r2.y + r2.height < r1.offsetY
  );
};
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
    Aligns,
    svga,
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
        "weather",
        "svga",
        "clock",
        "url",
        "audio",
        "stream",
        "facility",
        "brand",
        "position",
      ],
      componentTypeTip: {
        video: `一个节目最多${limits.video}个视频控件。`,
        image: `一个节目最多${limits.image}个图片控件。`,
        audio: `一个节目最多${limits.audio}个音频控件，音频和流媒体不能共存。`,
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
        { code: "8", name: "八方向" },
        { code: "12", name: "十二方向" },
      ],
      ...{ showSelectFacilities: false, facilityQ: "", facilities: [] },
      ...{
        showSelectBrands: false,
        brandQ: "",
        brandsGroupByFloor: [],
        brandTab: "",
      },
      previewForm: null,
      isSelectNavPointShown: false,
      bf: [],
      currentBF: null,
      navPointBindingCode: "",
      isSelectPreviewDevice: false,
      deviceCallback: null,
      deviceName: null,
      deviceCode: null,
      device: null,
      guideLineHelper: null,
      scale: 1,
      downPos: null,
      rectSelectConfig: null,
      selectedComponents: null,
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
    initScale() {
      if (!this.form) return 0;
      return Math.min(
        (this.$root.ww - 496 - 256 - 40) / this.form.width,
        (this.$root.wh - 80 - 40) / this.form.height
      );
    },
    stageScale() {
      return this.initScale * this.scale;
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
    selectedComponentsGroupConfig() {
      if (!this.selectedComponents || !this.selectedComponents.length)
        return null;
      const { form } = this;
      const { x1, x2, y1, y2 } = this.selectedComponents.reduce(
        ({ x1, x2, y1, y2 }, nxt) => ({
          x1: Math.min(x1, nxt.offsetX),
          y1: Math.min(y1, nxt.offsetY),
          x2: Math.max(x2, nxt.offsetX + nxt.width),
          y2: Math.max(y2, nxt.offsetY + nxt.height),
        }),
        { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity }
      );
      const { x, y, width, height } = {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      };
      return {
        x,
        y,
        width,
        height,
        draggable: true,
        stroke: "#2f6bff",
        strokeEnabled: true,
        zIndex: 10,
        dragBoundFunc: (pos) => {
          return {
            x:
              pos.x < 0
                ? 0
                : pos.x > form.width - width
                ? form.width - width
                : pos.x,
            y:
              pos.y < 0
                ? 0
                : pos.y > form.height - height
                ? form.height - height
                : pos.y,
          };
        },
      };
    },
    ...mapGetters(["config", "user"]),
  },
  methods: {
    handleAlignSet(type) {
      const group = this.selectedComponentsGroupConfig;
      switch (type) {
        case "top":
          this.selectedComponents.forEach((c) => {
            c.offsetY = group.y;
          });
          break;
        case "bottom":
          this.selectedComponents.forEach((c) => {
            c.offsetY = group.y + group.height - c.height;
          });
          break;
        case "left":
          this.selectedComponents.forEach((c) => {
            c.offsetX = group.x;
          });
          break;
        case "right":
          this.selectedComponents.forEach((c) => {
            c.offsetX = group.x + group.width - c.width;
          });
          break;
        case "center":
          this.selectedComponents.forEach((c) => {
            c.offsetX = Math.floor(group.x + group.width / 2 - c.width / 2);
          });
          break;
        case "middle":
          this.selectedComponents.forEach((c) => {
            c.offsetY = Math.floor(group.y + group.height / 2 - c.height / 2);
          });
          break;
        case "between-h":
          {
            const totalWidth = this.selectedComponents.reduce(
              (acc, nxt) => (acc += nxt.width),
              0
            );
            if (totalWidth > group.width) return;
            const avg = Math.ceil(
              (group.width - totalWidth) / (this.selectedComponents.length - 1)
            );
            this.selectedComponents.sort((a, b) => a.offsetX - b.offsetX);
            this.selectedComponents.forEach((component, i) => {
              if (i !== 0) {
                const last = this.selectedComponents[i - 1];
                component.offsetX = last.offsetX + last.width + avg;
              }
            });
          }
          break;
        case "between-v":
          {
            const totalHeight = this.selectedComponents.reduce(
              (acc, nxt) => (acc += nxt.height),
              0
            );
            if (totalHeight > group.height) return;
            const avg = Math.ceil(
              (group.height - totalHeight) /
                (this.selectedComponents.length - 1)
            );
            this.selectedComponents.sort((a, b) => a.offsetY - b.offsetY);
            this.selectedComponents.forEach((component, i) => {
              if (i !== 0) {
                const last = this.selectedComponents[i - 1];
                component.offsetY = last.offsetY + last.height + avg;
              }
            });
          }
          break;
      }
    },
    handleSelectedGroupDrag(e) {
      if (!this.selectedComponentsGroupConfig) return;
      const now = { x: e.target.x(), y: e.target.y() };
      const then = this.selectedComponentsGroupConfig;
      const offsetX = Math.floor(now.x - then.x);
      const offsetY = Math.floor(now.y - then.y);
      this.selectedComponents.forEach((c) => {
        c.offsetX += offsetX;
        c.offsetY += offsetY;
      });
    },
    handleStageMouseUp(e) {
      if (!this.downPos) return;
      if (!this.rectSelectConfig) {
        this.downPos = null;
        return;
      }
      this.downPos = null;
      const selectedComponents = this.form.components.reduce((acc, nxt) => {
        if (nxt.subComponents) {
          return [
            ...acc,
            ...Object.values(nxt.subComponents).filter((r1) =>
              haveIntersection(r1, this.rectSelectConfig)
            ),
          ];
        }
        if (!nxt.subComponents && haveIntersection(nxt, this.rectSelectConfig))
          return [...acc, nxt];
        return [...acc];
      }, []);

      if (selectedComponents.length === 1) {
        const component = selectedComponents[0];
        const index = this.form.components.findIndex((c) => c === component);
        this.activeComponent = component;
        this.selectedShapeName = "name_" + index;
        this.updateTransformer();
        return;
      }
      this.selectedComponents = selectedComponents;
      this.rectSelectConfig = null;
    },
    handleStageMouseMove(e) {
      if (!this.downPos) return;
      const pos = e.currentTarget.pointerPos;

      const x = Math.min(pos.x, this.downPos.x);
      const y = Math.min(pos.y, this.downPos.y);
      const width = Math.abs(pos.x - this.downPos.x);
      const height = Math.abs(pos.y - this.downPos.y);
      this.rectSelectConfig = {
        x,
        y,
        width,
        height,
        draggable: false,
        fill: "#2f6bff",
        opacity: 0.5,
        strokeEnabled: false,
        zIndex: 10,
      };
    },
    handleStageMouseDown(e) {
      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) return;
      const name = e.target.name();
      if (name === "selected-group") return;
      // find clicked rect by its name
      const component = this.getComponentByName(name);
      // clicked on stage - clear selection
      const clickBlank = e.target === e.target.getStage() || !component;
      if (clickBlank) {
        this.selectedShapeName = "";
        this.updateTransformer();
        this.downPos = e.currentTarget.pointerPos;
        this.selectedComponents = null;
        return;
      }
      this.selectedComponents = null;
      this.activeComponent = component;
      this.selectedShapeName = name;
      this.updateTransformer();
    },
    handleWheel(e) {
      e.preventDefault();
      const oldScale = this.scale;
      let newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      newScale = Math.max(newScale, 1);
      newScale = Math.min(newScale, 4);
      this.scale = newScale;
    },
    setScale(targetStageScale) {
      this.scale = targetStageScale / this.initScale;
    },
    handleDragEnd() {
      this.guideLineHelper && this.guideLineHelper.handleDragEnd();
    },
    handleDragMove(e) {
      if (this.selectedComponentsGroupConfig) return;
      if (!this.guideLineHelper) {
        const stage = this.$refs.stage.getNode();
        const layer = this.$refs.layer.getNode();
        this.guideLineHelper = new GuideLineHelper({ stage, layer });
      } else {
        if (e.target.getType() === "Shape")
          this.guideLineHelper.handleDragMove(e);
      }
    },
    async submitDevice(deviceCode) {
      this.isSelectPreviewDevice = false;
      await this.$nextTick();
      if (this.deviceCallback) this.deviceCallback(deviceCode);
    },
    selectDevice() {
      return new Promise(async (resolve) => {
        this.deviceCode = null;
        this.deviceName = null;
        this.device = null;
        this.deviceCallback = resolve;
        if (!this.bf.length) {
          const { data: buildings } = await ProgramApi.buildingFloor();
          this.bf = buildings;
        }
        const validBuilding = this.bf.find((b) => b.floors && b.floors.length);
        if (validBuilding)
          this.currentBF = [validBuilding.order, validBuilding.floors[0].order];
        this.isSelectPreviewDevice = true;
        await this.$nextTick();
        Config.getMapInfo(
          (e) => {
            if (e.type === "init") {
              Map_QM.showOrHidePoint(false);
              Map_QM.showOrHideSite(false);
            } else if (e.type === "device") {
              console.log(e);
              this.device = e.data;
              this.deviceCode = e.code;
              this.deviceName = e.name;
            }
          },
          this.user.mallCode,
          this.currentBF[0],
          this.currentBF[1],
          this.config.url
        );
      });
    },
    handleCurrentBfChange(v) {
      this.currentBF = v;
      if (v && v.length) {
        Map_QM.changeFloor(...v);
        if (this.isSelectPreviewDevice) {
          Map_QM.showOrHidePoint(false);
        } else {
          Map_QM.showOrHideDevice(false);
        }
        Map_QM.showOrHideSite(false);
        this.navPointBindingCode = null;
      }
    },
    async showSelectNavPoint(bindingCode) {
      this.navPointBindingCode = "";
      const bindings = bindingCode ? bindingCode.split("_") : null;
      if (!this.bf.length) {
        const { data: buildings } = await ProgramApi.buildingFloor();
        this.bf = buildings;
      }
      if (bindings && bindings.length === 3) {
        this.currentBF = [Number(bindings[0]), Number(bindings[1])];
        this.navPointBindingCode = bindingCode;
      } else {
        const validBuilding = this.bf.find((b) => b.floors && b.floors.length);
        if (validBuilding)
          this.currentBF = [validBuilding.order, validBuilding.floors[0].order];
      }
      this.isSelectNavPointShown = true;
      await this.$nextTick();
      Config.getMapInfo(
        (deviceSite) => {
          if (deviceSite.type === "init") {
            if (bindings && bindings.length === 3)
              Map_QM.setSite(Number(bindings[2]));
            else {
              Map_QM.showOrHideSite(false);
            }
            Map_QM.showOrHideDevice(false);
          } else if (
            deviceSite.type === "path" &&
            deviceSite.navPoint >= 0 &&
            this.currentBF
          ) {
            this.navPointBindingCode = `${this.currentBF[0]}_${this.currentBF[1]}_${deviceSite.navPoint}`;
          }
        },
        this.user.mallCode,
        this.currentBF[0],
        this.currentBF[1],
        this.config.url
      );
    },
    async getBrands() {
      this.brandsGroupByFloor = await ProgramApi.getBrands(this.brandQ);
      this.brandTab = this.brandsGroupByFloor[0]
        ? this.brandsGroupByFloor[0].floorName
        : "";
    },
    attachImage(component, parent) {
      if (component.image) delete component.image;
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
            last[last.typeCode === "视频" ? "previewPath" : "fileUrl"];
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
      if (this.form.components.length >= limits.total)
        return this.$message({
          type: "warning",
          message: `最多添加${limits.total}个控件。`,
        });
      switch (typeCode) {
        case "image":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "image")
              .length >= limits.image
          )
            return this.$message({
              type: "warning",
              message: `一个节目最多${limits.image}个图片控件。`,
            });
          break;
        case "video":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "video")
              .length >= limits.video
          )
            return this.$message({
              type: "warning",
              message: `一个节目最多${limits.video}个视频控件。`,
            });
          break;
        case "audio":
          if (
            this.form.components.filter(({ typeCode }) => typeCode === "audio")
              .length >= limits.audio
          )
            return this.$message({
              type: "warning",
              message: `一个节目最多${limits.audio}个音频控件。`,
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
    form2Body() {
      const {
        duration,
        backgroundColor,
        backgroundMaterial,
        components,
      } = this.form;
      return {
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
      };
    },
    async submit() {
      if (this.form.duration === "00:00:00")
        return this.$message({ type: "error", message: "节目时长不能为0" });
      const { code, msg } = await ProgramApi.put(this.form2Body());
      if (code === "200") {
        this.$message({ type: "success", message: msg });
        this.$emit("saved");
      } else if (code !== "201") {
        this.$message({
          type: "error",
          message: msg,
        });
      } else {
        await this.$confirm(msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const res = await ProgramApi.put({
          ...this.form2Body(),
          confirm: true,
        });
        if (res.code === "200") {
          this.$message({
            type: "success",
            message: res.msg,
          });
          this.$emit("saved");
        } else {
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
      }
    },
    reset() {
      this.form = null;
      this.activeComponent = null;
      this.selectedShapeName = "";
      this.colorIndex = 0;
      this.scale = 1;
      this.selectedComponents = null;
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
        this.form.components.forEach((component) => {
          component.color = this.colors[this.colorIndex];
          if (component.subComponents) {
            component.subComponents.forEach((subComponent) => {
              subComponent.color = this.colors[this.colorIndex];
            });
          }
          this.colorIndex++;
        });
        this.form.components = this.form.components.map(flatenComponent);
        this.form.components.forEach((component) => {
          this.attachImage(component);
          if (component.subComponents) {
            Object.values(component.subComponents).forEach((subComponent) => {
              this.attachImage(subComponent, component);
            });
          }
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
    async preview() {
      if (
        this.form.components.find(
          ({ typeCode }) =>
            typeCode === "facility" ||
            typeCode === "brand" ||
            typeCode === "position"
        )
      ) {
        const devCode = await this.selectDevice();
        const { code, data, msg } = await ProgramApi.preview({
          ...this.form2Body(),
          devCode,
        });
        if (code === "200") {
          this.previewForm = {
            ...data,
            width: this.form.width,
            height: this.form.height,
          };
          this.showPreview = true;
        } else {
          this.$message({ type: "error", message: msg });
        }
      } else {
        this.previewForm = this.form;
        this.showPreview = true;
      }
    },
  },
  watch: {
    showEditForm(val) {
      if (val) {
        this.init();
      } else {
        this.form = null;
        this.guideLineHelper = null;
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
.canvas-wrapper {
  padding: 20px;
  flex: 1;
  height: calc(100vh - 80px);
  position: relative;
  background: #ececec;
  display: flex;
  width: calc(100vw - 496px - 256px);
  overflow: auto;
}
.scroll-dummy {
  pointer-events: none;
}
.stage {
  position: absolute;
  top: 20px;
  left: 20px;
  transform-origin: top left;
}
#threeDiv {
  position: relative;
  width: 100%;
  height: 600px;
}
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
    }
    .right {
      flex: 0 0 496px;
      overflow-x: hidden;
      height: calc(100vh - 80px);
      display: flex;
      overflow: hidden;
      .r1 {
        flex: 0 0 188px;
        display: flex;
        flex-direction: column;
        height: 100%;
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
    .el-input-number__increase,
    .el-input-number__decrease {
      height: 42px;
      border: none;
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
