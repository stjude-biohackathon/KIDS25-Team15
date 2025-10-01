import { Box, Button } from "@mui/material"
import logo from '@assets/Jude-E.png'


export const Welcome = ({ onNext }: { onNext: () => void }) => {
    //Detect based on the location to use kisok screen or login screen
    // if (window.location.href.includes("kiosk")) 
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
            gap: 4,
        }}>
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                width: "25vw",
                height: "30vw"
            }}>
                <img src={logo} alt="St. Jude Children's Research Hospital" style=
                    {{ width: '100%', height: '100%' }} />
            </Box>
            <Button variant="contained" style={{
                fontSize: "5em",
                backgroundColor: "#D11947",
                borderRadius: "20px",
                maxWidth: "80vw",
                textTransform: "none"
            }}
                onClick={onNext}>
                Chat with Jude-E!
            </Button>
        </Box>
    )
}

