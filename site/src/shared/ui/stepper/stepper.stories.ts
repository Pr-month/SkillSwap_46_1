import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./stepper";

const meta = {
  title: "UI/Индикация шагов (Stepper)",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  args: {
    currentStep: 1,
    totalSteps: 3,
  },
  argTypes: {
    currentStep: {
      control: { type: "number" },
    },
    totalSteps: {
      control: { type: "number" },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3,
  },
};

export const SecondStep: Story = {
  args: {
    currentStep: 2,
    totalSteps: 3,
  },
};

export const ThirdStep: Story = {
  args: {
    currentStep: 3,
    totalSteps: 3,
  },
};
