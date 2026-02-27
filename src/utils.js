import * as THREE from 'three'

export function randomColor(colorA, colorB)
{
    if (arguments.length == 2)
    {
        const t = Math.random();
        const firstColor = new THREE.Color(colorA);
        const secondColor = new THREE.Color(colorB);
        const finalColor = firstColor.lerp(secondColor, t);
        return (finalColor);
    }
    return(Math.round((Math.random() * 0xffffff)));
}