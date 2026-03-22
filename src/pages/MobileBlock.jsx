import "./mobileBlock.css";

function MobileBlock() {
  return (
    <div className="mobile-block">

      <div className="mobile-card">

        <h1 className="mobile-title">Desktop Only 🚫</h1>

        <p className="mobile-desc">
          This application is not supported on mobile devices currently.
          <br />
          Please open it on a laptop or desktop for the best experience.
        </p>

      </div>

    </div>
  );
}

export default MobileBlock;