"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
} from "@mui/material";
import StarRating from "@/components/stars/StarRating";
import { getFailureMessage } from "@/utils/getMessages";

interface ResultsProps {
  score: number;
  passMarks: number;
  handleNextQuestion: () => void;
  onBack: () => void;
}

const Results = ({
  score,
  passMarks,
  handleNextQuestion,
  onBack,
}: ResultsProps) => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState<boolean>(false);
  const [failureMessage, setFailureMessage] = useState<string>("");

  useEffect(() => {
    if (score >= passMarks) {
      setIsSuccessModalOpen(true);
    } else {
      setIsFailureModalOpen(true);
      setFailureMessage(getFailureMessage(score));
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen fixed z-50 bg-transparent">
      {isSuccessModalOpen && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Success Modal */}
      <Dialog
        open={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          onBack();
        }}
        PaperProps={{
          style: {
            borderRadius: "30px",
            backgroundColor: "#E6F2E6",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#2E7D32",
            fontSize: "2.5rem",
            fontFamily: "Comic Sans MS, cursive",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <CheckCircleIcon sx={{ color: "#2E7D32", fontSize: "3rem" }} />
          Great Job! 🌟
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: "#2E7D32",
              fontSize: "1.5rem",
              fontFamily: "Comic Sans MS, cursive",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            You got {score.toFixed(2)}% correct!
          </DialogContentText>

          {/* Animated Star Rating */}
          <StarRating score={score} />

          <Button
            variant="contained"
            color="success"
            onClick={handleNextQuestion}
            sx={{
              fontFamily: "Comic Sans MS, cursive",
              fontSize: "1.2rem",
              textTransform: "none",
              marginTop: "20px",
            }}
          >
            Continue to Next Question
          </Button>
        </DialogContent>
      </Dialog>

      {/* Failure Modal */}
      <Dialog
        open={isFailureModalOpen}
        onClose={() => {
          setIsFailureModalOpen(false);
          onBack();
        }}
        PaperProps={{
          style: {
            borderRadius: "30px",
            backgroundColor: "#FFF3E0",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#F57C00",
            fontSize: "2.5rem",
            fontFamily: "Comic Sans MS, cursive",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          Try Again! 🧸
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: "#F57C00",
              fontSize: "1.5rem",
              fontFamily: "Comic Sans MS, cursive",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {failureMessage}
          </DialogContentText>

          {/* Animated Star Rating */}
          <StarRating score={score} />

          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              onBack();
              setIsFailureModalOpen(false);
            }}
            sx={{
              fontFamily: "Comic Sans MS, cursive",
              fontSize: "1.2rem",
              textTransform: "none",
              marginTop: "20px",
            }}
          >
            Try Again
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;
