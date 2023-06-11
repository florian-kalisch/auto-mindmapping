import React from "react";
import mermaid from "mermaid";
import { library, icon } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import html2canvas from "html2canvas";

library.add(fas);
library.add(far);

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "Helvetica Neue",
  fontColor: "white",
  themeCSS: `
  text, tspan {
    fill: #fff !important;
  }

  .fa {
    color: white;
  }

  rect.node-bkg, circle.node-bkg, .node-bkg.node-no-border {
    fill: #2c3e50 !important;
    stroke: #2c3e50 !important;
  }


  .node-circle {
    stroke-width: 2px !important;
  }

  .node-no-border {
    stroke-width: 0 !important;
  }

  path.edge {
    stroke: #2c3e50 !important;
  }

  [class^="node-line-"] {
    stroke: #2c3e50 !important;
  }

  .fa.icon-container {
    color: inherit !important;
    font-size: inherit !important;
  }
`
});

async function replaceFontAwesomeIconsWithInlineSVGs(mermaidContainer) {
  const iconElements = Array.from(mermaidContainer.querySelectorAll(".fa"));

  for (const iconElement of iconElements) {
    const iconClass = Array.from(iconElement.classList).find((className) =>
      className.startsWith("fa-")
    );
    const iconName = iconClass.slice(3);

    let faIcon = icon({ prefix: "fas", iconName });

    if (!faIcon) {
      let faIcon = icon({ prefix: "far", iconName });

      if (!faIcon) {
        console.error(`Icon with name ${iconName} not found.`);
        continue;
      }
    }

    iconElement.parentNode.replaceChild(faIcon.node[0], iconElement);
  }

  return mermaidContainer;
}

export default class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }

  async saveAsPNG(scale = 2) {
    let mermaidContainer = document.getElementById("mermaidChart");
    if (!mermaidContainer) {
      throw new Error("No Mermaid container element found");
    }

    mermaidContainer = await replaceFontAwesomeIconsWithInlineSVGs(
      mermaidContainer
    );

    const clonedMermaidContainer = mermaidContainer.cloneNode(true);

    clonedMermaidContainer.style.display = "none";
    document.body.appendChild(clonedMermaidContainer);

    clonedMermaidContainer.style.transform = `scale(${scale})`;
    clonedMermaidContainer.style.transformOrigin = "top left";
    clonedMermaidContainer.style.display = "block";

    html2canvas(clonedMermaidContainer, { scale: 1 })
      .then((canvas) => {
        document.body.removeChild(clonedMermaidContainer);

        const png = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = "chart.png";
        a.href = png;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => {
        document.body.removeChild(clonedMermaidContainer);
        throw new Error("Error generating PNG file: ", error);
      });
  }

  async saveAsSVG() {
    let mermaidContainer = document.getElementById("mermaidChart");
    if (!mermaidContainer) {
      throw new Error("No Mermaid container element found");
    }

    mermaidContainer = await replaceFontAwesomeIconsWithInlineSVGs(
      mermaidContainer
    );

    const clonedMermaidContainer = mermaidContainer.cloneNode(true);

    // Find all foreignObjects within the clonedMermaidContainer and scale them down
    const foreignObjects = clonedMermaidContainer.getElementsByTagName(
      "foreignObject"
    );
    for (let fo of foreignObjects) {
      let svg = fo.querySelector("svg");
      let scale = 0.8; // Change this to scale the SVG elements

      // Scale the dimensions and transform the SVG elements
      let oldWidth = parseFloat(fo.getAttribute("width"));
      let oldHeight = parseFloat(fo.getAttribute("height"));
      fo.setAttribute("width", oldWidth * scale + "px");
      fo.setAttribute("height", oldHeight * scale + "px");

      // Center the SVG elements vertically
      let yAttribute = parseFloat(fo.getAttribute("y") || "0");
      let yOffset = (oldHeight * (1 - scale)) / 2;
      fo.setAttribute("y", yAttribute + yOffset + "px");

      if (svg) {
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = "center";
        let div = svg.parentElement;
        if (div) {
          div.style.marginTop =
            parseFloat(div.style.marginTop || "0") * scale + "px";
        }
      }
    }

    clonedMermaidContainer.style.display = "none";
    document.body.appendChild(clonedMermaidContainer);

    clonedMermaidContainer.style.transformOrigin = "top left";
    clonedMermaidContainer.style.display = "block";

    try {
      const svgData = new XMLSerializer().serializeToString(
        clonedMermaidContainer
      );
      const preface = '<?xml version="1.0" standalone="no"?>\r\n';
      const svgBlob = new Blob([preface, svgData], {
        type: "image/svg+xml;charset=utf-8"
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "chart.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      document.body.removeChild(clonedMermaidContainer);
    } catch (error) {
      document.body.removeChild(clonedMermaidContainer);
      throw new Error("Error generating SVG file: ", error);
    }
  }

  constructor(props) {
    super(props);
    this.saveAsPNG = this.saveAsPNG.bind(this);
  }

  render() {
    return (
      <>
        <div className="buttonContainer">
          <button onClick={() => this.saveAsPNG()}>Save PNG Image</button>
          <button onClick={() => this.saveAsSVG()}>Save SVG Image</button>
        </div>
        <div id="mermaidChart" className="mermaid">
          {this.props.chart}
        </div>
      </>
    );
  }
}
