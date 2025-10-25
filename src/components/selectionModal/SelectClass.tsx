import { ClassesI } from "@/types/Classes";
import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { RenderRoleSelection } from "./RoleSelection";
import { StudentFlow } from "./StudentFlow";
import { ParentFlow } from "./ParentFlow";
import { useUpdateOrganizationUser } from "@/hooks/organizations/useUpdateOrganizationUser";
import { useSession } from "next-auth/react";

interface FirstTimeLoginProps {
  isOpen: boolean;
  onClose: () => void;
  classesData: ClassesI[];
}

const FirstTimeLogin: React.FC<FirstTimeLoginProps> = ({
  isOpen,
  onClose,
  classesData,
}) => {
  const { data: session, update } = useSession();
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<number | null>(null);

  const [selectedClass, setSelectedClass] = useState<ClassesI | null>(null);
  const [filteredClasses, setFilteredClasses] = useState<ClassesI[]>([]);

  const {
    onSubmit: updateClass,
    isPending,
    onSuccess,
  } = useUpdateOrganizationUser();

  const onSelectClass = () => {
    if (!role) return;
    updateClass({
      Id: session?.user.organizations?.[0].Id ?? "",
      RoleId: role,
    });
  };

  useEffect(() => {
    if (onSuccess) {
      onClose();
      update({ force: true });
    }
  }, [onSuccess]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRole(null);
      setSelectedClass(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const sorted = [...classesData].sort((a, b) => a.Order - b.Order);
    setFilteredClasses(sorted);
  }, [classesData]);

  const handleRoleSelect = (selectedRole: number) => {
    setRole(selectedRole);
    setStep(selectedRole === 2 ? 2 : 3);
  };

  const handleClassSelect = (classData: ClassesI) => {
    if (isPending) return;
    setSelectedClass(classData);
  };

  const handleSubmitClass = () => {
    if (selectedClass && onSelectClass) {
      onSelectClass();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 1
          ? "Welcome to Learning Adventures!"
          : role === 2
          ? "Choose Your Class"
          : "Parent Setup"
      }
      subTitle={
        step === 1
          ? "Let's get started on your learning journey!"
          : role === 2
          ? "Pick your adventure path!"
          : "Help your child get started"
      }
      size="lg"
      theme={step === 1 ? "playful" : role === 2 ? "playful" : "default"}
      headerIcon={"/Logo.png"}
    >
      {step === 1 && (
        <RenderRoleSelection handleRoleSelect={handleRoleSelect} />
      )}
      {step === 2 && (
        <StudentFlow
          filteredClasses={filteredClasses}
          handleClassSelect={handleClassSelect}
          handleSubmitClass={handleSubmitClass}
          isPending={isPending}
          selectedClass={selectedClass}
          setStep={setStep}
        />
      )}
      {step === 3 && (
        <ParentFlow setStep={setStep} filteredClasses={filteredClasses} />
      )}
    </Modal>
  );
};

export default FirstTimeLogin;
