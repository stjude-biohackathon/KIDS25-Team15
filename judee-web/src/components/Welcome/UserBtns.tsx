import { Box, Button } from "@mui/material"
import { userRoles as users } from "@assets/userRoles"
import { useAppState } from '@components/AppStateProvider/AppStateProvider';

export const UserBtns = ({ onNext }: { onNext: () => void }) => {
    const { setKey } = useAppState()
    
    const handleClick = (id: string) => {
        setKey("userRole", id)
        onNext()
    }
    
    const imgHeight = 140

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
        }}>
            <>
                {(Object.values(users) as Array<{
                    id: string;
                    label: string;
                    img: string;
                    percentWthIncr: number;
                }>).map(user => (
                    <Button key={user.label} variant="contained" style={{
                        fontSize: "6em",
                        backgroundColor: "#D11947",
                        borderRadius: "20px",
                        margin: "30px",
                    }} onClick={() => handleClick(user.id)}>

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