import { motion } from "framer-motion";
import {
  QuestionType,
  MathQuestionInput,
  DifficultyLevel,
} from "@/types/Questions";
import { MissingNumber } from "./MissingNumber";
import { Comparison } from "./Comparison";
import { NumberSequence } from "./NumberSequence";
import { MathEquation } from "./MathEquation";
import { Fraction } from "./Fractions";
import { SelectChoice } from "./SelectChoice";
import { WordProblems } from "./WordProblems";
import { ImageBased } from "./ImageBase";
import { Reading } from "./Reading";
import { FillInTheBlank } from "./FillInBlanks";
import { SentenceSorting } from "./SentenceSorting";

interface AddQuestionsStepProps {
  questionType: QuestionType;
  mathQuestions: MathQuestionInput[];
  newEquation: string;
  setNewEquation: (value: string) => void;
  newExplanation: string;
  setNewExplanation: (value: string) => void;
  newDifficulty: DifficultyLevel;
  setNewDifficulty: (value: DifficultyLevel) => void;
  addMathQuestion: () => void;
  removeMathQuestion: (index: number) => void;
  editQuestion?: (index: number, question: MathQuestionInput) => void;
}

const AddQuestionsStep: React.FC<AddQuestionsStepProps> = ({
  questionType,
  mathQuestions,
  newEquation,
  setNewEquation,
  newExplanation,
  setNewExplanation,
  newDifficulty,
  setNewDifficulty,
  addMathQuestion,
  removeMathQuestion,
  editQuestion,
}) => {
  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {questionType === "MissingNumber" && (
        <MissingNumber
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "Comparison" && (
        <Comparison
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "NumberSequence" && (
        <NumberSequence
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "MathEquation" && (
        <MathEquation
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "Fraction" && (
        <Fraction
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "SelectChoice" && (
        <SelectChoice
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "WordProblems" && (
        <WordProblems
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      {questionType === "ImageBased" && (
        <ImageBased
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}

      {questionType === "Reading" && (
        <Reading
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}

      {questionType === "FillInTheBlank" && (
        <FillInTheBlank
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}
      
      {questionType === "SentenceSorting" && (
        <SentenceSorting
          mathQuestions={mathQuestions}
          newEquation={newEquation}
          setNewEquation={setNewEquation}
          newExplanation={newExplanation}
          setNewExplanation={setNewExplanation}
          newDifficulty={newDifficulty}
          setNewDifficulty={setNewDifficulty}
          addMathQuestion={addMathQuestion}
          removeMathQuestion={removeMathQuestion}
          editQuestion={editQuestion}
        />
      )}

    </motion.div>
  );
};

export default AddQuestionsStep;
