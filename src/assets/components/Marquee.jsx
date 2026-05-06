const marqueeItems = Array.from({ length: 3 });

function MarqueeGroup({ hidden = false }) {
  return (
    <div className="marquee-group" aria-hidden={hidden}>
      {marqueeItems.map((_, index) => (
        <span className="marquee-text" style={{ fontFamily: "VT323, monospace" }} key={index}>
          System.out.println("&iexcl;BIENVENIDOS A CODEXLING!")
        </span>
      ))}
    </div>
  );
}

function Marquee() {
  return (
    <div className="marquee-container">
      <div className="marquee">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}

export default Marquee;
