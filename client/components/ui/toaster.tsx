import { useToast } from "./use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="cc-toast-content">
              {title && <ToastTitle className="cc-toast-title">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="cc-toast-description">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="cc-toast-close" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
