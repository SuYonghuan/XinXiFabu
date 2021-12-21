const GUIDELINE_OFFSET = 10;

export class GuideLineHelper {
  constructor({ stage, layer }) {
    Object.assign(this, { stage, layer });
  }
  getLineGuideItems(skipShape) {
    const { stage } = this;

    const guideItems = stage.find((node) => {
      return (
        node.getType() === "Shape" &&
        node.name() &&
        node.name().startsWith("name*")
      );
    });
    return [
      ...guideItems.filter((guideItem) => guideItem !== skipShape),
      stage,
    ];
  }
  getObjectSnappingEdges(node) {
    var box = node.getClientRect();
    const absPos = node.absolutePosition();

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: "start",
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: "end",
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: "start",
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: "end",
        },
      ],
    };
  }
  getGuides(guideItems, itemBounds) {
    var resultV = [];
    var resultH = [];

    guideItems.forEach((guideItem) => {
      const x = guideItem.x();
      const width = guideItem.width();
      const y = guideItem.y();
      const height = guideItem.height();
      [x, x + width, x + width / 2].forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
          var diff = Math.abs(lineGuide - itemBound.guide);
          // if the distance between guild line and object snap point is close we can consider this for snapping
          if (diff < GUIDELINE_OFFSET) {
            resultV.push({
              guideItem,
              lineGuide,
              diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });
      [y, y + height, y + height / 2].forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
          var diff = Math.abs(lineGuide - itemBound.guide);
          if (diff < GUIDELINE_OFFSET) {
            resultH.push({
              guideItem,
              lineGuide,
              diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });
    });

    var guides = [];

    // find closest snap
    var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
    if (minV) {
      guides.push({
        guideItem: minV.guideItem,
        lineGuide: minV.lineGuide,
        offset: minV.offset,
        orientation: "V",
        snap: minV.snap,
      });
    }
    if (minH) {
      guides.push({
        guideItem: minH.guideItem,
        lineGuide: minH.lineGuide,
        offset: minH.offset,
        orientation: "H",
        snap: minH.snap,
      });
    }
    return guides;
  }
  drawGuides(guides) {
    const { layer } = this;
    guides.forEach((lg) => {
      if (lg.orientation === "H") {
        var line = new Konva.Line({
          points: [-6000, 0, 6000, 0],
          stroke: "rgb(0, 161, 255)",
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
        });
        layer.add(line);
        line.absolutePosition({
          x: 0,
          y: lg.lineGuide,
        });
      } else if (lg.orientation === "V") {
        var line = new Konva.Line({
          points: [0, -6000, 0, 6000],
          stroke: "rgb(0, 161, 255)",
          strokeWidth: 1,
          name: "guid-line",
          dash: [4, 6],
        });
        layer.add(line);
        line.absolutePosition({
          x: lg.lineGuide,
          y: 0,
        });
      }
    });
  }
  drawTips(guides, item) {
    const { layer } = this;
    const x = item.x();
    const width = item.width();
    const y = item.y();
    const height = item.height();
    const box = { left: x, right: x + width, top: y, bottom: y + height };

    guides.forEach((lg) => {
      const item = lg.guideItem;
      const x = item.x();
      const width = item.width();
      const y = item.y();
      const height = item.height();
      const box1 = { left: x, right: x + width, top: y, bottom: y + height };
      switch (lg.orientation) {
        case "V": {
          const pairs = [
            [box1.top, box.top],
            [box1.top, box.bottom],
            [box1.bottom, box.top],
            [box1.bottom, box.bottom],
          ];
          const pair = pairs.sort(
            (a, b) => Math.abs(a[1] - a[0]) - Math.abs(b[1] - b[0])
          )[0];
          const line = new Konva.Line({
            points: [0, pair[0], 0, pair[1]],
            stroke: "rgb(255, 182, 243)",
            strokeWidth: 2,
            name: "guid-line",
          });
          layer.add(line);
          line.absolutePosition({
            x: lg.lineGuide,
            y: 0,
          });
          if (pair[0] - pair[1] !== 0) {
            const text = new Konva.Text({
              x: lg.lineGuide,
              y: (pair[0] + pair[1]) / 2,
              text: Math.floor(Math.abs(pair[0] - pair[1])),
              fontSize: 30,
              fill: "rgb(255, 182, 243)",
              name: "guid-line",
            });

            text.offsetY(text.height() / 2);
            if (text.y() < text.height() / 2) text.y(text.height() / 2);
            layer.add(text);
          }
          break;
        }
        case "H": {
          const pairs = [
            [box1.left, box.left],
            [box1.left, box.right],
            [box1.right, box.left],
            [box1.right, box.right],
          ];
          const pair = pairs.sort(
            (a, b) => Math.abs(a[1] - a[0]) - Math.abs(b[1] - b[0])
          )[0];
          const line = new Konva.Line({
            points: [pair[0], 0, pair[1], 0],
            stroke: "rgb(255, 182, 243)",
            strokeWidth: 2,
            name: "guid-line",
          });
          layer.add(line);
          line.absolutePosition({
            x: 0,
            y: lg.lineGuide,
          });
          if (pair[0] - pair[1] !== 0) {
            const text = new Konva.Text({
              x: (pair[0] + pair[1]) / 2,
              y: lg.lineGuide,
              text: Math.floor(Math.abs(pair[0] - pair[1])),
              fontSize: 30,
              fill: "rgb(255, 182, 243)",
              name: "guid-line",
            });

            text.offsetX(text.width() / 2);
            if (text.x() < text.width() / 2) text.x(text.width() / 2);
            layer.add(text);
          }
          break;
        }
      }
    });
  }
  handleDragMove(e) {
    const { layer } = this;
    layer.find(".guid-line").forEach((l) => l.destroy());

    // find possible snapping lines
    var guideItems = this.getLineGuideItems(e.target);

    // find snapping points of current object
    var itemBounds = this.getObjectSnappingEdges(e.target);

    // now find where can we snap current object
    var guides = this.getGuides(guideItems, itemBounds);

    // do nothing of no snapping
    if (!guides.length) {
      return;
    }

    this.drawGuides(guides);

    const absPos = e.target.absolutePosition();
    // now force object position
    guides.forEach((lg) => {
      switch (lg.snap) {
        case "start": {
          switch (lg.orientation) {
            case "V": {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case "H": {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
        case "center": {
          switch (lg.orientation) {
            case "V": {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case "H": {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
        case "end": {
          switch (lg.orientation) {
            case "V": {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case "H": {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
          }
          break;
        }
      }
    });

    e.target.absolutePosition(absPos);
    this.drawTips(guides, e.target);
  }
  handleDragEnd() {
    const { layer } = this;
    layer.find(".guid-line").forEach((l) => l.destroy());
  }
}
