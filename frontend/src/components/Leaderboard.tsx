import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Avatar,
  Badge,
  Icon,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';
import { Trophy, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useThemeMode } from '../themeProvider';

const GOLD = '#b7a27d';
const ITEMS_PER_PAGE = 10;

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalXP: number;
  level: number;
}

export const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { mode } = useThemeMode();

  const hoverBg = mode === 'dark' ? 'black' : 'white';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/progress/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeaderboard = leaderboard.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Icon as={Trophy} color="yellow.500" boxSize={6} />;
      case 2:
        return <Icon as={Medal} color="gray.400" boxSize={6} />;
      case 3:
        return <Icon as={Medal} color="orange.600" boxSize={6} />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge colorScheme="yellow">🥇 1st</Badge>;
    if (rank === 2) return <Badge colorScheme="gray">🥈 2nd</Badge>;
    if (rank === 3) return <Badge colorScheme="orange">🥉 3rd</Badge>;
    return <Badge>#{rank}</Badge>;
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>{t('leaderboard.loading', 'Loading...')}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            <Flex align="center">
              <Icon as={Trophy} mr={2} />
              {t('leaderboard.title', 'Leaderboard')}
            </Flex>
          </Heading>

          {/* Top 3 Podium */}
          {leaderboard.length === 0 ? (
            <Text textAlign="center" py={8}>
              {t('leaderboard.no_data', 'No data available yet')}
            </Text>
          ) : leaderboard.length >= 3 ? (
            <HStack spacing={4} justify="center" mb={6} flexWrap="wrap">
              {/* 2nd Place */}
              <VStack>
                <Box position="relative">
                  <Avatar size="lg" name={leaderboard[1].name} bg={GOLD} />
                  <Box position="absolute" bottom="-2" right="-2">
                    <Icon as={Medal} color="gray.400" boxSize={6} />
                  </Box>
                </Box>
                <Text fontWeight="bold" fontSize="sm">
                  {leaderboard[1].name}
                </Text>
                <Badge colorScheme="blue">Level {leaderboard[1].level}</Badge>
                <Text fontSize="xs" color="gray.500">
                  {leaderboard[1].totalXP.toLocaleString()} XP
                </Text>
              </VStack>

              {/* 1st Place */}
              <VStack>
                <Box position="relative">
                  <Avatar size="xl" name={leaderboard[0].name} bg={GOLD} />
                  <Box position="absolute" bottom="-2" right="-2">
                    <Icon as={Trophy} color="yellow.500" boxSize={8} />
                  </Box>
                </Box>
                <Text fontWeight="bold">
                  {leaderboard[0].name}
                </Text>
                <Badge colorScheme="yellow" fontSize="md">Level {leaderboard[0].level}</Badge>
                <Text fontSize="sm" color="gray.500">
                  {leaderboard[0].totalXP.toLocaleString()} XP
                </Text>
              </VStack>

              {/* 3rd Place */}
              <VStack>
                <Box position="relative">
                  <Avatar size="lg" name={leaderboard[2].name} bg={GOLD} />
                  <Box position="absolute" bottom="-2" right="-2">
                    <Icon as={Medal} color="orange.600" boxSize={6} />
                  </Box>
                </Box>
                <Text fontWeight="bold" fontSize="sm">
                  {leaderboard[2].name}
                </Text>
                <Badge colorScheme="blue">Level {leaderboard[2].level}</Badge>
                <Text fontSize="xs" color="gray.500">
                  {leaderboard[2].totalXP.toLocaleString()} XP
                </Text>
              </VStack>
            </HStack>
          ) : null}

          {/* Full Leaderboard Table */}
          {leaderboard.length > 0 && (
            <>
              <Box overflowX="auto">
                <Table variant="unstyled" size="sm">
                  <Thead>
                    <Tr>
                      <Th borderBottom="none">{t('leaderboard.rank', 'Rank')}</Th>
                      <Th borderBottom="none">{t('leaderboard.student', 'Student')}</Th>
                      <Th isNumeric borderBottom="none">{t('leaderboard.level', 'Level')}</Th>
                      <Th isNumeric borderBottom="none">{t('leaderboard.xp', 'XP')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentLeaderboard.map((entry, index) => {
                      const globalIndex = startIndex + index;
                      return (
                        <Tr key={entry.userId} _hover={{ bg: hoverBg }} borderBottom="none">
                          <Td borderBottom="none">
                            <HStack>
                              {getRankIcon(globalIndex + 1)}
                              {getRankBadge(globalIndex + 1)}
                            </HStack>
                          </Td>
                          <Td borderBottom="none">
                            <HStack>
                              <Avatar size="sm" name={entry.name} bg={GOLD} />
                              <Text fontWeight={globalIndex < 3 ? 'bold' : 'normal'}>
                                {entry.name}
                              </Text>
                            </HStack>
                          </Td>
                          <Td isNumeric borderBottom="none">
                            <Badge colorScheme="blue">{entry.level}</Badge>
                          </Td>
                          <Td isNumeric fontWeight={globalIndex < 3 ? 'bold' : 'normal'} borderBottom="none">
                            {entry.totalXP.toLocaleString()}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Flex justify="center" align="center" mt={4} gap={4}>
                  <Button
                    size="sm"
                    onClick={handlePrevPage}
                    isDisabled={currentPage === 1}
                    leftIcon={<Icon as={ChevronLeft} />}
                  >
                    {t('leaderboard.previous', 'Previous')}
                  </Button>
                  <Text fontSize="sm">
                    {t('leaderboard.page', 'Page')} {currentPage} {t('leaderboard.of', 'of')} {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    onClick={handleNextPage}
                    isDisabled={currentPage === totalPages}
                    rightIcon={<Icon as={ChevronRight} />}
                  >
                    {t('leaderboard.next', 'Next')}
                  </Button>
                </Flex>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Leaderboard;
