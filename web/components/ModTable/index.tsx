import React, { useEffect, useState } from "react";
import { Table, Text, Modal, Button, Group, ScrollArea } from "@mantine/core";
import { MdCheckCircle, MdDownload } from "react-icons/md";
import { Mod } from "../../types";
import cx from "clsx";
import classes from "./TableScrollArea.module.css";

const ModTable: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const response = await fetch("/api/list-mods");
        const data = await response.json();
        setMods(data.mods);
      } catch (error) {
        console.error("Error fetching mods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMods();
  }, []);

  const handleDownloadClick = (mod: Mod) => {
    setSelectedMod(mod);
    setIsModalOpen(true);
  };

  const confirmUpdate = async () => {
    if (selectedMod) {
      try {
        const response = await fetch("/api/update-mod", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            githubUrl: selectedMod.githubUrl,
            folderName: selectedMod.name,
          }),
        });

        if (response.ok) {
          console.log(`${selectedMod.name} updated successfully.`);
          // Optionally, you can refresh the mod list here
        } else {
          const errorData = await response.json();
          console.error(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error updating mod:", error);
      }
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return <Text ta="center" pt="10px">Loading mods...</Text>;
  }

  return (
    <ScrollArea
      h={300}
      w="90%"
      m="0 auto"
      pt="20px"
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table miw={700}>
        <Table.Thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
        >
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Version</Table.Th>
            <Table.Th>SPT Version</Table.Th>
            <Table.Th>Update Available</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mods.map((mod, index) => (
            <Table.Tr key={index}>
              <Table.Td>{mod.name}</Table.Td>
              <Table.Td>{mod.author}</Table.Td>
              <Table.Td>{mod.version}</Table.Td>
              <Table.Td>{mod.sptVersion}</Table.Td>
              <Table.Td>
                {mod.update ? (
                  <MdDownload
                    size={24}
                    title="Download available"
                    onClick={() => handleDownloadClick(mod)}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <MdCheckCircle size={24} color="green" title="Up-to-date" />
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update ${selectedMod?.name}`}
      >
        <Text>Do you want to update {selectedMod?.name}?</Text>
        <Group justify="flex-end">
          <Button onClick={confirmUpdate}>Yes</Button>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            No
          </Button>
        </Group>
      </Modal>
    </ScrollArea>
  );
};

export default ModTable;
