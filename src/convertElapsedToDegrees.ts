// 360 in N seconds
// 0 -> 0
// 90 -> 2.5s
// 180 -> 5s
// 270 -> 7.5s
// 360 -> 10s
// 1s = 360 / 10 = 36 degrees per second
// write function to convert intElapsed into 0-360 and receive time duration in seconds as param
export function convertElapsedToDegrees(elapsed: number, duration: number): number {
    const degreesPerSecond = 360 / duration;
    return (elapsed * degreesPerSecond);
}
