import Spline from '@splinetool/react-spline';

export default function HeroSpline() {
  return (
    <div className="absolute inset-0">
      <Spline scene="https://prod.spline.design/ESO6PnMadasO0hU3/scene.splinecode" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
