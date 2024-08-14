import React, { useState } from 'react';
import { TextInput, Button, Text, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Mod } from '../types'; // Adjust the import path as necessary

const AddModForm: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  // Specify the form values type using the Mod interface
  const form = useForm<Pick<Mod, 'githubUrl'>>({
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues: { githubUrl: 'http://www.github.com' },

    validate: {
      githubUrl: (value) => 
        value ? (/^(https:\/\/github\.com\/.+)$/.test(value) ? null : 'Please enter a valid GitHub URL') : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const response = await fetch('/api/add-mod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: values.githubUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error adding mod');
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
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="GitHub URL"
            placeholder="Enter GitHub URL"
            {...form.getInputProps('githubUrl')}
            required
          />
          <Button type="submit" mt="md">Add Mod</Button>
        </form>
        {message && <Text mt="md">{message}</Text>}
    </Flex>
  );
};

export default AddModForm;
