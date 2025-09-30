import dory from './dory.png'
import nemo from './nemo.png'

export const userRoles: Record<string, { label: string; id: string; img: string; percentWthIncr: number }> = {
    kid: {
        label: "Kid",
        id: "kid",
        img: nemo,
        //Calculated based on the image aspect ratio
        percentWthIncr: 1.72
    }, parent: {
        label: "Parent/ Caregiver",
        id: "parent",
        img: dory,
        percentWthIncr: 1.16
    }
}