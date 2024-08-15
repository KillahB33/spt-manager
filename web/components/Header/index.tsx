import { Container, Group, Text } from "@mantine/core";
import classes from "./Header.module.css";

const SPT_VERSION = process.env.NEXT_PUBLIC_SPT_VERSION;

export function Header() {
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Text size="xl">SPT Manager</Text>
        <Text>SPT v.{SPT_VERSION}</Text>
      </Container>
    </header>
  );
}
