import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import "./judee.css";

const JudeE = () => {
  const [sayHi, setSayHi] = useState(false);

  return (
    <motion.div
      className="wall-e"
      initial={{ x: 0 }}
    //   animate={{ x: [0, 300, 0] }} // rover left → right → left
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute" }}
    >
      {/* Head */}
      <div className="head-container">
        <div className="eyes-container">
          <div className="left eye">
            <div className="screw screw-1"></div>
            <div className="screw screw-2"></div>
            <div className="screw screw-3"></div>
            <div className="pupil"></div>
          </div>
          <div className="right eye">
            <div className="screw screw-1"></div>
            <div className="screw screw-2"></div>
            <div className="screw screw-3"></div>
            <div className="pupil"></div>
          </div>
        </div>
        <div className="head"></div>
        <div className="neck-container">
          <div className="neck-top"></div>
          <div className="neck-bottom"></div>
        </div>
      </div>

      {/* Body */}
      <div className="body-container">
        <div className="left arm"></div>
        <div className="body">
          <div className="body-top">
            <div className="box">
              <div className="line"></div>
            </div>
            <div className="center">
              <div className="lcd"></div>
              <div className="button"></div>
            </div>
            <div className="box"></div>
          </div>
          <div className="text">
            <div className="text-full">
              WALL·<span className="text-e">E</span>
            </div>
            <div className="red-circle"></div>
          </div>
        </div>
        <div className="right arm"></div>
      </div>

      {/* Hands */}
      <div className="hands-container">
        <div className="left hand">
          <div className="palm-container">
            <div className="palm"></div>
          </div>
        </div>

        {/* Right hand with waving motion */}
        <motion.div
          className="right hand"
          animate={sayHi ? { rotate: [-10, -40, -10] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => setSayHi(!sayHi)}
          style={{ cursor: "pointer" }}
        >
          <div className="palm-container">
            <div className="palm"></div>
          </div>
        </motion.div>
      </div>

      {/* Wheels */}
      <div className="wheels-container">
        <div className="left wheel">
          <div className="wheel-left-part"></div>
          <div className="wheel-right-part">
            <div className="wheel-container">
              <div className="wheel-top"></div>
            </div>
            <div className="wheel-container">
              <div className="wheel-bottom"></div>
            </div>
            <div className="wheel-tube"></div>
          </div>
        </div>
        <div className="right wheel">
          <div className="wheel-left-part"></div>
          <div className="wheel-right-part">
            <div className="wheel-container">
              <div className="wheel-top"></div>
            </div>
            <div className="wheel-container">
              <div className="wheel-bottom"></div>
            </div>
            <div className="wheel-tube"></div>
          </div>
        </div>
      </div>

      {/* Speech bubble when hand is waving */}
      {sayHi && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: "-50px",
            right: "40px",
            background: "white",
            padding: "8px 12px",
            borderRadius: "12px",
            border: "2px solid black",
          }}
        >
          <Typography variant="body2">Hi 👋</Typography>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JudeE;
