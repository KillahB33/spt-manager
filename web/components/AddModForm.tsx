import React, { useState } from "react";
import {
  TextInput,
  Text,
  Flex,
  ActionIcon,
  useMantineTheme,
  Modal,
} from "@mantine/core";
import {
  MdArrowForward,
  MdCloudDownload,
  MdCheckCircle,
  MdError,
} from "react-icons/md";
import { useField } from "@mantine/form";

const AddModForm: React.FC = () => {
  const theme = useMantineTheme();
  const [message, setMessage] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const field = useField({
    initialValue: "https://www.github.com",
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/add-mod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: field.getValue() }), // Note the change here
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

  return (
    <Flex
      mih={50}
      bg="rgba(0, 0, 0, .3)"
      gap="md"
      justify="flex-end"
      align="center"
      direction="row"
      wrap="nowrap"
    >
      <Text size="lg">Add Mod</Text>
      <TextInput
        {...field.getInputProps()}
        radius="xl"
        size="md"
        placeholder="release github url"
        rightSectionWidth={42}
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
  );
};

export default AddModForm;
