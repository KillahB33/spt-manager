import React, { useState, useEffect } from "react";
import {
  TextInput,
  Text,
  Flex,
  ActionIcon,
  useMantineTheme,
  Modal,
  Grid,
  Button,
} from "@mantine/core";
import { MdArrowForward, MdCheckCircle, MdError } from "react-icons/md";
import { useField } from "@mantine/form";

const AddModForm: React.FC = () => {
  const theme = useMantineTheme();
  const [message, setMessage] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [inputWidth, setInputWidth] = useState<number>(500); // Set an initial width
  const [restartRequired, setRestartRequired] = useState(false);

  const field = useField<string>({
    initialValue: "",
    onValueChange: (value) => {
      // Calculate width based on input length
      const minWidth = 500; // Minimum width
      const maxWidth = 800; // Maximum width
      const newWidth = Math.min(
        Math.max(minWidth, value.length * 10 + 20),
        maxWidth
      );
      setInputWidth(newWidth);
    },
  });

  const handleFocus = () => {
    const value = field.getValue();
    const minWidth = 500;
    const maxWidth = 800;
    const newWidth = Math.min(
      Math.max(minWidth, value.length * 10 + 20),
      maxWidth
    );
    setInputWidth(newWidth);
  };

  const handleBlur = () => {
    if (!field.getValue()) {
      setInputWidth(300); // Reset the width if the input is empty
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/add-mod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: field.getValue() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setModalOpen(true);
      } else {
        setMessage(`Error: ${data.error}`);
        setModalOpen(true);
      }
    } catch (error) {
      setMessage("Error adding mod");
      setModalOpen(true);
    }
  };

  useEffect(() => {
    // Poll the backend for the current state
    const interval = setInterval(async () => {
      const res = await fetch("/api/restart-req"); // Create an API to fetch the state
      const data = await res.json();
      setRestartRequired(data.restartRequired);
      console.log(data.restartRequired);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    const res = await fetch("/api/restart-manager", { method: "POST" });
    if (res.ok) {
      // Reset the state after restart
      setRestartRequired(false);
    }
  };

  return (
    <Grid pt="5px">
      <Grid.Col span={4}></Grid.Col>
      <Grid.Col span={4}>
        <Flex justify="center" align="center">
          {restartRequired && (
            <Button color="red" onClick={handleRestart}>
              Restart Required
            </Button>
          )}
        </Flex>
      </Grid.Col>
      <Grid.Col span={4}>
        <Flex
          mih={50}
          gap="md"
          justify="flex-end"
          align="center"
          direction="row"
          wrap="nowrap"
          pr="10px"
          pb="20px"
        >
          <Text size="lg">Add Mod</Text>
          <TextInput
            {...field.getInputProps()}
            radius="xl"
            size="md"
            placeholder="release github url"
            rightSectionWidth={42}
            style={{ width: `${inputWidth}px`, transition: "width 0.3s ease" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rightSection={
              <ActionIcon
                size={30}
                radius="xl"
                color={theme.primaryColor}
                variant="filled"
                onClick={handleSubmit}
              >
                <MdArrowForward
                  style={{ width: "18rem", height: "18rem" }}
                  stroke="1.5"
                />
              </ActionIcon>
            }
          />

          <Modal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            title={message.startsWith("Error") ? "Error" : "Success"}
            centered
          >
            <Flex align="center" justify="center" direction="column">
              {message.startsWith("Error") ? (
                <MdError size={40} color="red" />
              ) : (
                <MdCheckCircle size={40} color="green" />
              )}
              <Text mt="md">{message}</Text>
            </Flex>
          </Modal>
        </Flex>
      </Grid.Col>
    </Grid>
  );
};

export default AddModForm;
