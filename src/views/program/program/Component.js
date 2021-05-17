export const weatherStyles = [
  { type: 0, width: 500, height: 80 },
  { type: 1, width: 400, height: 80 },
];
export const clockStyles = [
  { type: 0, width: 320, height: 80 },
  { type: 1, width: 320, height: 80 },
  { type: 2, width: 320, height: 80 },
  { type: 3, width: 320, height: 80 },
  { type: 4, width: 320, height: 80 },
];
export const componentSubMap = {
  facility: [
    "signImage_logo",
    "signImage_direction",
    "signTxt_distance",
    "signTxt_time",
    "signTxt_name",
  ],
  brand: [
    "signImage_direction",
    "signImage_logo",
    "signTxt_name",
    "signTxt_distance",
    "signTxt_time",
  ],
  position: ["signImage_direction", "signTxt_distance", "signTxt_time"],
}
class BaseComponent {
  constructor({ typeCode, zIndex, color, j }) {
    const component = {
      typeCode,
      zIndex,
      width: 200,
      height: 200,
      offsetX: 0,
      offsetY: 0,
      materials: [],
      color,
    };
    if (j) component.offsetX += j * 200
    Object.assign(this, component)
  }
}
class ImageComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color }) {
    super({ typeCode, zIndex, color })
    this.transition = "随机";
    this.transitionPeriod = 15;
  }
}
class UrlComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color }) {
    super({ typeCode, zIndex, color })
    this.refreshPeriod = "00:00:00";
  }
}
class TextComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color, j }) {
    super({ typeCode, zIndex, color, j })
    this.backgroundColor = (typeCode === 'signTxt_distance' || typeCode === 'signTxt_time' || typeCode === 'signTxt_name') ? null : "#FFFFFF";
    this.backgroundOpacity = 100;
    this.fontColor = "#000000";
    this.fontSize = 24;
    this.fontStyle = "正常";
    this.animationSpeed = "中等";
    this.animation = "从左往右";
    this.materials = [];
  }
}
class WeatherComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color }) {
    super({ typeCode, zIndex, color })
    this.cityName = "";
    this.style = 0;
    this.width = weatherStyles[0].width;
    this.height = weatherStyles[0].height;
    this.fontColor = "#FFFFFF";
    this.backgroundColor = "#777777";
  }
}
class ClockComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color }) {
    super({ typeCode, zIndex, color })
    this.fontColor = "#FFFFFF";
    this.style = 0;
    this.width = clockStyles[0].width;
    this.height = clockStyles[0].height;
    this.backgroundColor = "#777777";
  }
}
class SignComponent extends BaseComponent {
  constructor({ typeCode, zIndex, color }) {
    super({ typeCode, zIndex, color })
    delete this.offsetX;
    delete this.offsetY;
    delete this.width;
    delete this.height;
    this.bindingCode = null;
    this.bindingName = null;
    this.dirTheme = null;
    this.arrowTheme = null;
    this.subComponents = componentSubMap[typeCode].map((code, j) => new (typeCodeClassMap[code])({ typeCode: code, j, color })).reduce((acc, nxt) => ({ ...acc, [nxt.typeCode]: nxt }), {});
    if (typeCode !== 'position') this.logoTheme = null;
  }
}
export const typeCodeClassMap = {
  audio: BaseComponent,
  html: BaseComponent,
  stream: BaseComponent,
  video: BaseComponent,
  clock: ClockComponent,
  image: ImageComponent,
  text: TextComponent,
  url: UrlComponent,
  weather: WeatherComponent,
  facility: SignComponent,
  brand: SignComponent,
  position: SignComponent,
  "signImage_logo": BaseComponent,
  "signImage_direction": BaseComponent,
  "signTxt_distance": TextComponent,
  "signTxt_time": TextComponent,
  "signTxt_name": TextComponent,
}

export default ({ typeCode, zIndex, color }) => new typeCodeClassMap[typeCode]({ typeCode, zIndex, color })