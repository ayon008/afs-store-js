export default function Skeleton({ className = '', style = {}, animate = true }) {
    // animate: whether to show a subtle pulse shimmer
    const anim = animate ? 'animate-pulse' : '';
    return <span aria-hidden className={`inline-block ${className} bg-gray-100 rounded ${anim}`} style={style} />;
}
