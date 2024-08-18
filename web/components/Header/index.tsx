import { Container, Text } from "@mantine/core";
import classes from "./Header.module.css";
import Head from 'next/head';

const SPT_VERSION = process.env.NEXT_PUBLIC_SPT_VERSION;

export function Header() {
  return (
    <>
      <Head>
        <title>SPT Manager</title>
        <meta name="Mod Manager for Single Player Tarkov" content="SPT Manager" />
      </Head>
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <Text size="xl">SPT Manager</Text>
          <Text>SPT v{SPT_VERSION}</Text>
        </Container>
      </header>
    </>
  );
}
