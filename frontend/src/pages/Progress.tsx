import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ProgressTracker from '../components/ProgressTracker';
import BadgeShowcase from '../components/BadgeShowcase';
import Leaderboard from '../components/Leaderboard';

const Progress: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading size="xl">
            {t('progress.title', 'My Progress')}
          </Heading>

          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>📊 {t('progress.overview', 'Overview')}</Tab>
              <Tab>🏆 {t('progress.badges', 'Badges')}</Tab>
              <Tab>🥇 {t('progress.leaderboard', 'Leaderboard')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <ProgressTracker />
              </TabPanel>

              <TabPanel px={0}>
                <BadgeShowcase />
              </TabPanel>

              <TabPanel px={0}>
                <Leaderboard />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
};

export default Progress;
