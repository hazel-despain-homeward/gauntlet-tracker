import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { BORDER_COLOR, CTA_COLOR, MESSAGING_COLOR, NAMED_COLOR, TEXT_COLOR } from './design/tokens';
import { api } from './api/client';
import type { Finalized, StateView } from './types';
import { Header } from './components/Header';
import { TabBar, type TabKey } from './components/TabBar';
import { TeamSelect } from './components/TeamSelect';
import { PlayScreen } from './components/PlayScreen';
import { WeekResults } from './components/WeekResults';
import { EditTimes } from './components/EditTimes';
import { WinnerCard } from './components/WinnerCard';
import { RecentWinners } from './components/RecentWinners';
import { RulesModal } from './components/RulesModal';
import { StatsPage } from './components/StatsPage';
import { SectionEyebrow } from './components/ui';

const Main = styled.main`
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 20px 64px;
`;

const Banner = styled.div<{ $error?: boolean }>`
  margin-bottom: 18px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  background: ${(p) =>
    p.$error ? MESSAGING_COLOR.BACKGROUND.FAILURE : MESSAGING_COLOR.BACKGROUND.SUCCESS};
  color: ${(p) => (p.$error ? MESSAGING_COLOR.ACCENT.FAILURE : MESSAGING_COLOR.ACCENT.SUCCESS)};
`;

const Muted = styled.p`
  color: ${TEXT_COLOR.SECONDARY};
  font-size: 14px;
`;

const EmptyHistory = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: ${TEXT_COLOR.SECONDARY};
  font-size: 13.5px;
  background: ${NAMED_COLOR.WHITE};
  border: 1px solid ${BORDER_COLOR.PRIMARY};
  border-radius: 14px;
`;

export default function App() {
  const [view, setView] = useState<StateView | null>(null);
  const [finalized, setFinalized] = useState<Finalized | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>('current');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(() =>
    localStorage.getItem('gauntlet:team'),
  );

  const chooseTeam = (name: string) => {
    localStorage.setItem('gauntlet:team', name);
    setSelectedTeam(name);
  };
  // Change identity only — never touches recorded times (fix those via Edit times).
  const changeTeam = () => {
    localStorage.removeItem('gauntlet:team');
    setSelectedTeam(null);
  };

  const load = useCallback(async () => {
    try {
      setError(null);
      setView(await api.getState());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeWeek = view?.weeks.find((w) => w.id === view.activeWeekId) ?? null;
  const hasFinals = !!view?.weeks.some((w) => w.status === 'final');

  // When there's no open week, surface the most recently finalized week's winner card
  // (so it survives a reload, not just the in-memory finalize response).
  const lastFinal = view ? [...view.weeks].reverse().find((w) => w.status === 'final') : undefined;
  const shownFinal: Finalized | null =
    finalized ??
    (view && !activeWeek && lastFinal?.slack?.message
      ? {
          week: lastFinal,
          slack: {
            posted: lastFinal.slack.posted,
            channel: lastFinal.slack.channel,
            message: lastFinal.slack.message,
            detail: lastFinal.slack.detail ?? null,
          },
        }
      : null);

  const handleEntry = async (team: string, seconds: number | null, dnp: boolean) => {
    try {
      setError(null);
      const resp = await api.setEntry(team, seconds, dnp);
      setView(resp.view);
      // The 7th report auto-finalizes and posts to Slack on the server.
      if (resp.finalized) {
        setFinalized(resp.finalized);
        setEditing(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save entry');
    }
  };

  const handleNext = async () => {
    setBusy(true);
    try {
      setError(null);
      setView(await api.nextWeek());
      setFinalized(null);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start next week');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Reset the whole season? This permanently clears ALL weeks, times, and winners and starts over at a fresh Week 1. This cannot be undone.',
      )
    )
      return;
    setBusy(true);
    try {
      setError(null);
      setView(await api.reset());
      setFinalized(null);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset season');
    } finally {
      setBusy(false);
    }
  };

  // Forget a remembered team that no longer exists in the roster.
  useEffect(() => {
    if (selectedTeam && view && !view.teams.some((t) => t.name === selectedTeam)) {
      localStorage.removeItem('gauntlet:team');
      setSelectedTeam(null);
    }
  }, [selectedTeam, view]);

  const myEntry = selectedTeam && activeWeek ? activeWeek.entries[selectedTeam] : undefined;
  const myReported = !!(myEntry && (myEntry.dnp || myEntry.seconds != null));

  return (
    <>
      <Header />
      <TabBar active={tab} onChange={setTab} />
      <Main>
        {error && <Banner $error>{error}</Banner>}

        {tab === 'current' &&
          (!view ? (
            <Muted>Loading…</Muted>
          ) : shownFinal ? (
            <WinnerCard
              week={shownFinal.week}
              slack={shownFinal.slack}
              busy={busy}
              celebrate={!!finalized}
              onNext={handleNext}
            />
          ) : activeWeek && view.progress ? (
            editing ? (
              <EditTimes
                week={activeWeek}
                teams={view.teams}
                onEntry={handleEntry}
                onDone={() => setEditing(false)}
                onReset={handleReset}
              />
            ) : !selectedTeam ? (
              <TeamSelect teams={view.teams} onSelect={chooseTeam} />
            ) : myReported ? (
              <WeekResults
                week={activeWeek}
                teams={view.teams}
                progress={view.progress}
                myTeam={selectedTeam}
                onViewRules={() => setRulesOpen(true)}
                onRedo={() => handleEntry(selectedTeam, null, false)}
                onEdit={() => setEditing(true)}
                onChangeTeam={changeTeam}
              />
            ) : (
              <PlayScreen
                week={activeWeek}
                team={selectedTeam}
                onLog={(seconds) => handleEntry(selectedTeam, seconds, false)}
                onDnp={() => handleEntry(selectedTeam, null, true)}
                onViewRules={() => setRulesOpen(true)}
                onEdit={() => setEditing(true)}
                onChangeTeam={changeTeam}
              />
            )
          ) : (
            <Muted>No active week. (Finalize the current one to start the next.)</Muted>
          ))}

        {tab === 'history' &&
          (view && hasFinals ? (
            <RecentWinners weeks={view.weeks} teams={view.teams} />
          ) : (
            <>
              <SectionEyebrow>History</SectionEyebrow>
              <EmptyHistory>No completed weeks yet. Winners will show up here.</EmptyHistory>
            </>
          ))}

        {tab === 'stats' && view && <StatsPage weeks={view.weeks} teams={view.teams} />}
      </Main>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </>
  );
}
