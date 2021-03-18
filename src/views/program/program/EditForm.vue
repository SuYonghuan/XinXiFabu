<template>
  <div v-if="form">
    <el-row type="flex" justify="space-between" style="margin-bottom:30px;">
      <el-col>
        <span class="prefix">节目名称：{{ form.name }}</span>
        <span class="prefix">分辨率：{{ form.resolution }}</span>
      </el-col>
      <el-col style="text-align: right;">
        <el-button disabled>预 览</el-button>
        <el-button type="primary" @click="submit">保 存</el-button>
        <el-button @click="$emit('close')">关 闭</el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="5">
        <el-row>
          <el-col
            style="text-align: center;height: 140px;"
            :span="8"
            :key="code"
            v-for="code in componentTypeOrder"
          >
            <img
              @click="appendComponent(code)"
              class="logo"
              :src="logos[code]"
              :alt="componentTypes[code]"
            />
            <div @click="appendComponent(code)">
              {{ componentTypes[code] }}
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="14" class="canvas-wrapper">
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
            <v-rect
              v-for="(component, i) in form.components"
              :key="i"
              :name="'name_' + i"
              :config="{
                x: component.offsetX,
                y: component.offsetY,
                width: component.width,
                height: component.height,
                draggable: true,
                fill: component.color,
                shadowBlur: 10,
                strokeEnabled: false,
                zIndex: i,
                dragBoundFunc: (pos) => {
                  return {
                    x:
                      pos.x < 0
                        ? 0
                        : pos.x > form.width - component.width
                        ? form.width - component.width
                        : pos.x,
                    y:
                      pos.y < 0
                        ? 0
                        : pos.y > form.height - component.height
                        ? form.height - component.height
                        : pos.y,
                  };
                },
              }"
              @dragend="handleDragend"
              @transformend="handleTransformEnd"
            ></v-rect>
            <v-transformer
              ref="transformer"
              :config="{
                rotateEnabled: false,
                boundBoxFunc: transformBoundBoxFunc,
              }"
            />
          </v-layer>
        </v-stage>
      </el-col>
      <el-col :span="5">
        <el-form
          v-if="form"
          class="form"
          label-width="100px"
          ref="form"
          :model="form"
          :rules="rules"
        >
          <h5>节目设置</h5>
          <el-form-item label="节目时长" prop="duration">
            <el-time-picker
              v-model="form.duration"
              value-format="HH:mm:ss"
              placeholder="选择时长"
            >
            </el-time-picker>
          </el-form-item>
          <h5>页面控件</h5>
          <div
            :class="(activeComponent ? '' : 'selected') + ' component-item'"
            @click="activeComponent = null"
          >
            背景
          </div>

          <div
            v-for="(component, i) in form.components"
            :key="i"
            :class="
              (activeComponent === component ? 'selected' : '') +
                ' component-item'
            "
            @click="setActiveComponent(i)"
          >
            <span class="cube" :style="'background: ' + component.color"></span>
            <span>{{ componentTypes[component.typeCode] }}组件</span>
            <template v-if="form.components.length === 1"></template>
            <el-button-group v-else-if="i === 0">
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-arrow-down"
                @click="down(i)"
              ></el-button>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-bottom"
                @click="bottom(i)"
              ></el-button>
            </el-button-group>
            <el-button-group v-else-if="i === form.components.length - 1">
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-arrow-up"
                @click="up(i)"
              ></el-button>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-top"
                @click="top(i)"
              ></el-button>
            </el-button-group>
            <el-button-group v-else>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-top"
                @click="top(i)"
              ></el-button>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-arrow-up"
                @click="up(i)"
              ></el-button>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-arrow-down"
                @click="down(i)"
              ></el-button>
              <el-button
                size="mini"
                type="text"
                class="updown"
                icon="el-icon-bottom"
                @click="bottom(i)"
              ></el-button>
            </el-button-group>
          </div>
          <h5>{{ activeComponent ? "元素属性" : "背景属性" }}</h5>
          <template v-if="!activeComponent">
            <el-form-item label="背景颜色" prop="backgroundColor">
              <el-color-picker v-model="form.backgroundColor" show-alpha>
              </el-color-picker>
            </el-form-item>
            <el-form-item label="背景图片" prop="backgroundMaterial">
              <el-button
                type="primary"
                v-if="!form.backgroundMaterial"
                @click="openMaterialModal"
                >选择素材</el-button
              >
              <div v-else>
                {{ form.backgroundMaterial.name }}
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-view"
                  @click="preview(form.backgroundMaterial)"
                ></el-button>
                <el-button
                  size="mini"
                  type="text"
                  class="updown"
                  icon="el-icon-delete-solid"
                  @click="form.backgroundMaterial = null"
                ></el-button>
              </div>
            </el-form-item>
          </template>
          <template v-else>
            <el-form
              style="padding-left:20px;"
              label-width="70px"
              label-position="left"
              :model="activeComponent"
            >
              <div class="pos-items">
                <el-form-item
                  label-width="20px"
                  class="short-item"
                  label="X"
                  prop="offsetX"
                >
                  <el-input
                    type="number"
                    :min="0"
                    v-model="activeComponent.offsetX"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  label-width="20px"
                  class="short-item"
                  label="Y"
                  prop="offsetY"
                >
                  <el-input
                    type="number"
                    v-model="activeComponent.offsetY"
                  ></el-input>
                </el-form-item>
                <br />
                <el-form-item
                  label-width="20px"
                  class="short-item"
                  label="宽"
                  prop="width"
                >
                  <el-input
                    type="number"
                    v-model="activeComponent.width"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  label-width="20px"
                  class="short-item"
                  label="高"
                  prop="height"
                >
                  <el-input
                    type="number"
                    v-model="activeComponent.height"
                  ></el-input>
                </el-form-item>
              </div>
              <template v-if="activeComponent.typeCode === 'image'">
                <el-form-item label="显示效果">
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
                <el-form-item label="切换时间">
                  <el-input-number
                    v-model="activeComponent.transitionPeriod"
                    :step="1"
                    step-strictly
                    :min="1"
                    :max="86400"
                  ></el-input-number
                  >秒
                </el-form-item>
                <el-form-item label="素材">
                  <el-button type="primary" @click="openMaterialModal"
                    >添加素材</el-button
                  >
                </el-form-item>
                <el-table
                  v-if="activeComponent.materials.length"
                  :data="activeComponent.materials"
                >
                  <el-table-column prop="name" key="name" label="名称">
                    <template slot-scope="scope">
                      <div class="ellipsis">{{ scope.row.name }}</div>
                    </template></el-table-column
                  >
                  <el-table-column
                    prop="op"
                    key="op"
                    label="操作"
                    width="180px"
                  >
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-view"
                        @click="preview(scope.row)"
                      ></el-button>
                      <el-button
                        v-if="scope.$index !== 0"
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="swap(scope.$index, scope.$index - 1)"
                      ></el-button>
                      <el-button
                        v-if="
                          scope.$index !== activeComponent.materials.length - 1
                        "
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="swap(scope.$index, scope.$index + 1)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-delete-solid"
                        @click="removeMaterial(scope.$index)"
                      ></el-button> </template
                  ></el-table-column>
                </el-table>
              </template>
              <template v-else-if="activeComponent.typeCode === 'video'">
                <el-form-item label="素材">
                  <el-button type="primary" @click="openMaterialModal"
                    >添加素材</el-button
                  >
                </el-form-item>
                <el-table
                  v-if="activeComponent.materials.length"
                  :data="activeComponent.materials"
                >
                  <el-table-column prop="name" key="name" label="名称">
                    <template slot-scope="scope">
                      <div class="ellipsis">{{ scope.row.name }}</div>
                    </template></el-table-column
                  >
                  <el-table-column
                    prop="op"
                    key="op"
                    label="操作"
                    width="180px"
                  >
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-view"
                        @click="preview(scope.row)"
                      ></el-button>
                      <el-button
                        v-if="scope.$index !== 0"
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="swap(scope.$index, scope.$index - 1)"
                      ></el-button>
                      <el-button
                        v-if="
                          scope.$index !== activeComponent.materials.length - 1
                        "
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="swap(scope.$index, scope.$index + 1)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-delete-solid"
                        @click="removeMaterial(scope.$index)"
                      ></el-button> </template
                  ></el-table-column>
                </el-table>
              </template>
              <template v-else-if="activeComponent.typeCode === 'url'">
                <el-form-item label="刷新时间" prop="refreshPeriod">
                  <el-time-picker
                    v-model="activeComponent.refreshPeriod"
                    value-format="HH:mm:ss"
                    placeholder="选择刷新时间"
                  >
                  </el-time-picker>
                </el-form-item>
                <el-form-item label="素材" prop="materials">
                  <el-button
                    type="primary"
                    v-if="!activeComponent.materials.length"
                    @click="openMaterialModal"
                    >选择素材</el-button
                  >
                  <div v-else>
                    {{ activeComponent.materials[0].name }}
                    <el-button
                      size="mini"
                      type="text"
                      class="updown"
                      icon="el-icon-view"
                      @click="preview(activeComponent.materials[0])"
                    ></el-button>
                    <el-button
                      size="mini"
                      type="text"
                      class="updown"
                      icon="el-icon-delete-solid"
                      @click="activeComponent.materials = []"
                    ></el-button>
                  </div>
                </el-form-item>
              </template>
              <template v-else-if="activeComponent.typeCode === 'html'">
                <el-form-item label="刷新时间" prop="refreshPeriod">
                  <el-time-picker
                    v-model="activeComponent.refreshPeriod"
                    value-format="HH:mm:ss"
                    placeholder="选择刷新时间"
                  >
                  </el-time-picker>
                </el-form-item>
                <el-form-item label="素材" prop="materials">
                  <el-button
                    type="primary"
                    v-if="!activeComponent.materials.length"
                    @click="openMaterialModal"
                    >选择素材</el-button
                  >
                  <div v-else>
                    {{ activeComponent.materials[0].name }}
                    <el-button
                      size="mini"
                      type="text"
                      class="updown"
                      icon="el-icon-view"
                      @click="preview(activeComponent.materials[0])"
                    ></el-button>
                    <el-button
                      size="mini"
                      type="text"
                      class="updown"
                      icon="el-icon-delete-solid"
                      @click="activeComponent.materials = []"
                    ></el-button>
                  </div>
                </el-form-item>
              </template>
              <template v-else-if="activeComponent.typeCode === 'text'">
                <el-form-item label="背景色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.backgroundColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
                <el-form-item label="背景透明度" prop="backgroundOpacity">
                  <el-slider
                    v-model="activeComponent.backgroundOpacity"
                  ></el-slider>
                </el-form-item>
                <el-form-item label="字体颜色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.fontColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-input-number
                    v-model="activeComponent.fontSize"
                    :step="1"
                    step-strictly
                    :min="1"
                    :max="1000"
                  ></el-input-number
                  >px
                </el-form-item>
                <el-form-item label="样式">
                  <el-select v-model="activeComponent.fontStyle">
                    <el-option
                      :key="key"
                      :value="key"
                      :label="key"
                      v-for="key in ['正常', '加粗', '斜体', '加粗、斜体']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="滚动速度">
                  <el-select v-model="activeComponent.animationSpeed">
                    <el-option
                      :key="key"
                      :value="key"
                      :label="key"
                      v-for="key in ['慢', '中等', '快', '很快']"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="字幕滚动">
                  <el-select v-model="activeComponent.animation">
                    <el-option
                      :key="key"
                      :value="key"
                      :label="key"
                      v-for="key in [
                        '从左往右',
                        '从右往左',
                        '从上往下',
                        '从下往上',
                      ]"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="素材">
                  <el-button type="primary" @click="openMaterialModal"
                    >添加素材</el-button
                  >
                </el-form-item>
                <el-table
                  v-if="activeComponent.materials.length"
                  :data="activeComponent.materials"
                >
                  <el-table-column prop="name" key="name" label="名称">
                    <template slot-scope="scope">
                      <div class="ellipsis">{{ scope.row.name }}</div>
                    </template></el-table-column
                  >
                  <el-table-column
                    prop="op"
                    key="op"
                    label="操作"
                    width="180px"
                  >
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-view"
                        @click="preview(scope.row)"
                      ></el-button>
                      <el-button
                        v-if="scope.$index !== 0"
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="swap(scope.$index, scope.$index - 1)"
                      ></el-button>
                      <el-button
                        v-if="
                          scope.$index !== activeComponent.materials.length - 1
                        "
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="swap(scope.$index, scope.$index + 1)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-delete-solid"
                        @click="removeMaterial(scope.$index)"
                      ></el-button> </template
                  ></el-table-column>
                </el-table>
              </template>
              <template v-else-if="activeComponent.typeCode === 'weather'">
                <el-form-item label="城市名称">
                  <el-input
                    :maxlength="20"
                    v-model="activeComponent.cityName"
                  ></el-input>
                </el-form-item>
                <el-form-item label="数据选择">
                  <el-select v-model="activeComponent.components" multiple>
                    <el-option
                      :key="key"
                      :value="key"
                      :label="key"
                      v-for="key in weatherComponents"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="字体颜色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.fontColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-input-number
                    v-model="activeComponent.fontSize"
                    :step="1"
                    step-strictly
                    :min="1"
                    :max="1000"
                  ></el-input-number
                  >px
                </el-form-item>
                <el-form-item label="背景色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.backgroundColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
              </template>
              <template v-else-if="activeComponent.typeCode === 'clock'">
                <el-form-item label="字体颜色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.fontColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-input-number
                    v-model="activeComponent.fontSize"
                    :step="1"
                    step-strictly
                    :min="1"
                    :max="1000"
                  ></el-input-number
                  >px
                </el-form-item>
                <el-form-item label="背景色" prop="backgroundColor">
                  <el-color-picker
                    v-model="activeComponent.backgroundColor"
                    show-alpha
                  >
                  </el-color-picker>
                </el-form-item>
              </template>
              <template v-else-if="activeComponent.typeCode === 'audio'">
                <el-form-item label="素材">
                  <el-button type="primary" @click="openMaterialModal"
                    >添加素材</el-button
                  >
                </el-form-item>
                <el-table
                  v-if="activeComponent.materials.length"
                  :data="activeComponent.materials"
                >
                  <el-table-column prop="name" key="name" label="名称">
                    <template slot-scope="scope">
                      <div class="ellipsis">{{ scope.row.name }}</div>
                    </template></el-table-column
                  >
                  <el-table-column
                    prop="op"
                    key="op"
                    label="操作"
                    width="180px"
                  >
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-view"
                        @click="preview(scope.row)"
                      ></el-button>
                      <el-button
                        v-if="scope.$index !== 0"
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="swap(scope.$index, scope.$index - 1)"
                      ></el-button>
                      <el-button
                        v-if="
                          scope.$index !== activeComponent.materials.length - 1
                        "
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="swap(scope.$index, scope.$index + 1)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-delete-solid"
                        @click="removeMaterial(scope.$index)"
                      ></el-button> </template
                  ></el-table-column>
                </el-table>
              </template>
              <template v-else-if="activeComponent.typeCode === 'stream'">
                <el-form-item label="素材">
                  <el-button type="primary" @click="openMaterialModal"
                    >添加素材</el-button
                  >
                </el-form-item>
                <el-table
                  v-if="activeComponent.materials.length"
                  :data="activeComponent.materials"
                >
                  <el-table-column prop="name" key="name" label="名称">
                    <template slot-scope="scope">
                      <div class="ellipsis">{{ scope.row.name }}</div>
                    </template></el-table-column
                  >
                  <el-table-column
                    prop="op"
                    key="op"
                    label="操作"
                    width="180px"
                  >
                    <template slot-scope="scope">
                      <el-button
                        v-if="scope.$index !== 0"
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-up"
                        @click="swap(scope.$index, scope.$index - 1)"
                      ></el-button>
                      <el-button
                        v-if="
                          scope.$index !== activeComponent.materials.length - 1
                        "
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-arrow-down"
                        @click="swap(scope.$index, scope.$index + 1)"
                      ></el-button>
                      <el-button
                        size="mini"
                        type="text"
                        class="updown"
                        icon="el-icon-delete-solid"
                        @click="removeMaterial(scope.$index)"
                      ></el-button> </template
                  ></el-table-column>
                </el-table>
              </template>
            </el-form>
          </template>
        </el-form>
      </el-col>
    </el-row>
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
          @click="addMaterial(material)"
        >
          <div class="item">
            <object v-if="material.fileUrl" :data="material.fileUrl"></object>
            <img v-else :src="logos[activeComponent.typeCode]" alt="" />
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
      :visible.sync="showPreview"
    >
      <template v-if="previewMaterial">
        <object
          style="width:100%;min-height:500px;"
          :data="
            previewMaterial.fileUrl
              ? previewMaterial.fileUrl
              : previewMaterial.url
          "
        ></object>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ProgramApi } from "../program.js";
function importAll(r) {
  let obj = {};
  r.keys().forEach((key) => {
    obj[key.replace("./", "").replace(".svg", "")] = r(key);
  });
  return obj;
}
const logos = importAll(require.context("./logo", false, /\.(png|jpe?g|svg)$/));
export default {
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
            },
            trigger: "blur",
          },
        ],
      },
      activeComponent: null,
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
      ],
      weatherComponents: [
        "城市",
        "天气图标",
        "温度",
        "风力",
        "空气质量",
        "湿度",
      ],
      colorIndex: 0,
      logos,
      componentTypes: {},
      showSelectMaterial: false,
      materials: [],
      q: "",
      pageIndex: 0,
      total: 0,
      showPreview: false,
      previewMaterial: null,
    };
  },
  computed: {
    stageScale() {
      if (!this.form) return 0;
      return Math.min(
        ((window.innerWidth - 40) * 0.5833333) / this.form.width,
        (window.innerHeight - 200) / this.form.height
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
  },
  methods: {
    addMaterial(material) {
      if (!this.activeComponent) this.form.backgroundMaterial = material;
      else this.activeComponent.materials.push(material);
      this.setComponents();
      this.showSelectMaterial = false;
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

      const component = this.form.components[name.replace("name_", "")];
      if (component) {
        this.activeComponent = component;
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = "";
      }
      this.updateTransformer();
    },
    handleTransformEnd({ target }) {
      const {
        index,
        attrs: { x, y, scaleX, scaleY },
      } = target;
      const component = this.form.components[index];
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
      this.setComponents();
    },
    handleDragend({
      target: {
        index,
        attrs: { x, y },
      },
    }) {
      const component = this.form.components[index];
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
      this.selectedShapeName = "name_" + i;
      this.updateTransformer();
    },
    appendComponent(typeCode) {
      if (!this.form.components) this.form.components = [];
      const component = {
        typeCode,
        zIndex: this.form.components.length,
        width: 200,
        height: 200,
        offsetX: 0,
        offsetY: 0,
        materials: [],
        color: this.colors[this.colorIndex],
      };
      switch (typeCode) {
        case "image":
          component.transition = "随机";
          component.transitionPeriod = 15;
          component.materials = [];
          break;
        case "url":
          component.refreshPeriod = "00:00:00";
          component.materials = [];
          break;
        case "html":
          component.refreshPeriod = "00:00:00";
          component.materials = [];
          break;
        case "text":
          component.backgroundColor = "#FFFFFF";
          component.backgroundOpacity = 100;
          component.fontColor = "#000000";
          component.fontSize = 16;
          component.fontStyle = "正常";
          component.animationSpeed = "中等";
          component.animation = "从左往右";
          component.materials = [];
          break;
        case "weather":
          component.cityName = "";
          component.components = this.weatherComponents;
          component.fontColor = "#000000";
          component.fontSize = 16;
          component.backgroundColor = "#FFFFFF";
          break;
        case "clock":
          component.fontColor = "#000000";
          component.fontSize = 16;
          component.backgroundColor = "#FFFFFF";
          break;
        case "audio":
          component.materials = [];
        case "stream":
          component.materials = [];
          break;
        default:
          break;
      }
      this.colorIndex++;
      if (this.colorIndex === this.colors.length) this.colorIndex = 0;
      this.activeComponent = component;
      this.form.components.push(component);
      this.form = {
        ...this.form,
      };
    },
    down(i) {
      const tmp = this.form.components[i + 1];
      this.form.components[i + 1] = this.form.components[i];
      this.form.components[i] = tmp;
      this.setComponents();
    },
    up(i) {
      const tmp = this.form.components[i - 1];
      this.form.components[i - 1] = this.form.components[i];
      this.form.components[i] = tmp;
      this.setComponents();
    },
    top(i) {
      const component = this.form.components[i];
      this.form.components.splice(i, 1);
      this.form.components.unshift(component);
      this.setComponents();
    },
    bottom(i) {
      const component = this.form.components[i];
      this.form.components.splice(i, 1);
      this.form.components.push(component);
      this.setComponents();
    },
    async submit() {
      const isValid = await new Promise((resolve) =>
        this.$refs.form.validate(resolve)
      );
      console.log(isValid, this.form);
    },
    async init() {
      this.form = null;
      const { data, code, msg } = await ProgramApi.getDetail({
        code: this.code,
      });
      if (code === "200") {
        this.form = data;
        this.form.components &&
          this.form.components.forEach((component) => {
            component.color = this.colors[this.colorIndex];
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
      const { pageIndex, activeComponent, q } = this;
      const { data, code, msg } = await ProgramApi.getMaterials({
        typeCode: activeComponent ? activeComponent.typeCode : "image",
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
    preview(material) {
      this.previewMaterial = material;
      this.showPreview = true;
    },
    removeMaterial(i) {
      this.activeComponent.materials.splice(i, 1);
    },
    swap(i, j) {
      const tmp = this.activeComponent.materials[i];
      this.activeComponent.materials[i] = this.activeComponent.materials[j];
      this.activeComponent.materials[j] = tmp;
      this.activeComponent.materials = [...this.activeComponent.materials];
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
  },
  mounted() {
    this.init();
  },
  async created() {
    const componentTypes = await ProgramApi.getComponentTypes();
    this.componentTypes = componentTypes;
  },
};
</script>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prefix {
  margin-right: 10px;
}
.edit .el-dialog {
  width: 100%;
  height: 100%;
}
.canvas-wrapper {
  height: calc(100vh - 200px);
  position: relative;
  box-shadow: 0px 2px 10px 0px rgb(0 0 0 / 30%);
  border: 1px solid rgba(221, 221, 221, 1);
}
.form {
  margin-left: 36px;
  border-left: 1px solid #999;
  height: calc(100vh - 200px);
  overflow-y: scroll;
  box-shadow: 0px 2px 10px 0px rgb(0 0 0 / 30%);
  border: 1px solid rgba(221, 221, 221, 1);
}
h5 {
  padding-left: 19px;
  color: rgba(80, 80, 80, 1);
  font-size: 19px;
  line-height: 50px;
  font-weight: bold;
  border-top: 1px solid #999;
}
.component-item {
  position: relative;
  display: flex;
  padding-left: 25px;
  font-size: 14px;
  line-height: 28px;
  margin-bottom: 12px;
  justify-content: space-between;
  cursor: pointer;
}
.selected {
  background: #eff9ff;
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
  padding-left: 40px;
}
.pos-items::before {
  content: "位置";
  position: absolute;
  top: 14px;
  left: 0;
}
.short-item {
  display: inline-block;
  width: 100px;
}
.short-item + .short-item {
  margin-left: 10px;
}
.logo {
  width: 57px;
  height: 57px;
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
<style>
.konvajs-content {
  flex-shrink: 0;
  border: 1px solid #ddd;
  box-shadow: 0px 2px 10px 0px rgb(0 0 0 / 30%);
  border: 1px solid rgba(221, 221, 221, 1);
}
.md .el-dialog {
  min-width: 610px;
  max-width: 610px;
}
</style>
