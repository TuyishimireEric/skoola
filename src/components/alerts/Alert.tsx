import { useEffect } from "react";
import { 
  BsCheckCircleFill, 
  BsInfoCircleFill,
  BsExclamationTriangleFill,
  BsXCircleFill 
} from "react-icons/bs";
import { IoMdClose } from "react-icons/io";

export enum AlertType {
  SUCCESS = "SUCCESS",
  DEFAULT = "DEFAULT",
  DANGER = "DANGER",
  INFO = "INFO",
  WARNING = "WARNING",
}

interface AlertProps {
  alertType: AlertType;
  title: string;
  description?: string;
  close: () => void;
  className?: string;
  timeOut?: number;
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  const getAlertStyles = () => {
    switch (props.alertType) {
      case AlertType.SUCCESS:
        return {
          bgColor: "bg-green-100",
          borderColor: "border-green-400",
          textColor: "text-green-700",
          icon: <BsCheckCircleFill className="text-green-500 text-2xl" />,
          animation: "animate__bounceIn"
        };
      case AlertType.DANGER:
        return {
          bgColor: "bg-red-100",
          borderColor: "border-red-400",
          textColor: "text-red-700",
          icon: <BsXCircleFill className="text-red-500 text-2xl" />,
          animation: "animate__shakeX"
        };
      case AlertType.WARNING:
        return {
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-400",
          textColor: "text-yellow-700",
          icon: <BsExclamationTriangleFill className="text-yellow-500 text-2xl" />,
          animation: "animate__rubberBand"
        };
      case AlertType.INFO:
        return {
          bgColor: "bg-blue-100",
          borderColor: "border-blue-400",
          textColor: "text-blue-700",
          icon: <BsInfoCircleFill className="text-blue-500 text-2xl" />,
          animation: "animate__bounceIn"
        };
      default:
        return {
          bgColor: "bg-gray-100",
          borderColor: "border-gray-400",
          textColor: "text-gray-700",
          icon: <BsInfoCircleFill className="text-gray-500 text-2xl" />,
          animation: "animate__fadeIn"
        };
    }
  };

  const styles = getAlertStyles();

  useEffect(() => {
    if (props.timeOut !== undefined) {
      const timer = setTimeout(() => {
        props.close();
      }, props.timeOut);
      
      return () => clearTimeout(timer);
    }
  }, [props]);

  return (
    <div
      className={`flex items-center w-full rounded-2xl p-2 px-4 border-2 ${styles.bgColor} ${styles.borderColor} ${styles.textColor} animate__animated ${styles.animation} ${props.className || ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1">{props.title}</h3>
          {props.description && (
            <p className="text-xs">{props.description}</p>
          )}
        </div>
      </div>
      <button 
        onClick={props.close}
        className="ml-auto flex-shrink-0 bg-white rounded-full p-1 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Close"
      >
        <IoMdClose className="text-gray-500 text-lg" />
      </button>
    </div>
  );
};

export default Alert;