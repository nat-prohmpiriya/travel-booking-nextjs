"use client";

import { Button, Modal } from "antd";

export default function Home() {
  const [modal, contextHolder] = Modal.useModal();

  const countDown = () => {
    let secondsToGo = 5;

    const instance = modal.success({
      title: 'This is a notification message',
      content: `This modal will be destroyed after ${secondsToGo} second.`,
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
      instance.update({
        content: `This modal will be destroyed after ${secondsToGo} second.`,
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Button type="primary" onClick={countDown}>Open modal to close in 5s</Button>
      {contextHolder}
    </div>
  );
}
