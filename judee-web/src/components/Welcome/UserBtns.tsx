import { Box, Button } from "@mui/material"
import dory from '@assets/dory.png'
import nemo from '@assets/nemo.png'

export const UserBtns = ({ onNext }: { onNext: () => void }) => {
    const imgHeight = 140
    const users = [{
        label: "Kid",
        img: nemo,
        //Calculated based on the image aspect ratio
        percentWthIncr: 1.72
    }, {
        label: "Parent/Caregiver",
        img: dory,
        percentWthIncr: 1.16
    }]

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
        }}>
            <>

                {users.map(user => (
                    <Button key={user.label} variant="contained" style={{
                        fontSize: "6em",
                        backgroundColor: "#D11947",
                        borderRadius: "20px",
                        margin: "30px",
                    }} onClick={onNext}>

                        <img src={user.img} alt={user.label} style={{ 
                            width: `${imgHeight * user.percentWthIncr}px`, 
                            height: `${imgHeight}px`
                            }} />
                        <span>{user.label}</span>
                    </Button>
                ))}
            </>
        </Box>
    );
}