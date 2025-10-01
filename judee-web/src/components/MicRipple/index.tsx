import React, { useState, useRef, useEffect } from 'react';
import { keyframes, styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import IconButton from '@mui/material/IconButton';
// Keyframes for ripple animation
const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Multiple ripple overlays for wave effect
const RippleOverlay = () => (
    <>
        {[0, 0.5, 1, 1.5, 2, 2.5].map((delay, idx) => (
            <StyledRipple
                key={idx}
                style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
            />
        ))}
    </>
);

const StyledRipple = styled('span')(({ theme }) => ({
    position: 'absolute',
    bottom: '20%',
    right: '-250px',
    transform: 'translate(50%, 50%)',
    width: 200,
    height: 200,
    borderRadius: '50%',
    // backgroundColor: theme.palette.primary.main,
    backgroundColor: '#1874DC',
    opacity: 0,
    pointerEvents: 'none',
    animation: `${ripple} 3s ease-out infinite`,
    zIndex: 1,
}));

const MicRipple = ({ isListening, handleMicClick }: { isListening: boolean, handleMicClick: () => void }) => {


    return (
        <>
            {/* Mic Icon */}
            <IconButton
                color={isListening ? 'warning' : 'secondary'}
                onClick={handleMicClick}
                sx={{
                    animation: isListening
                        ? 'pulse-radius 1.2s infinite cubic-bezier(0.4,0,0.2,1)'
                        : 'none',
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                    borderRadius: '8px',
                    boxShadow: isListening
                        ? '0 0 0 1px #C10F3A'
                        : 'none',
                    backgroundColor: isListening ? 'transparent' : 'darkred.main',
                    '@keyframes pulse-radius': {
                        '0%': {
                            transform: 'scale(1)',
                        },
                        '50%': {
                            transform: 'scale(1.18)',
                        },
                        '100%': {
                            transform: 'scale(1)',
                        },
                    },
                }}
            >
                <MicIcon />
            </IconButton>

            {/* Ripple effect overlay */}
            {isListening && <span><RippleOverlay /></span>}
        </>
    )
}

export default MicRipple;