import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'

/** Simple 2-party layout — avoids VideoConference carousel updatePages bugs. */
export function TwoPartyVideoLayout({ headerOffset = '4.5rem' }: { headerOffset?: string }) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  )

  return (
    <div
      className="flex flex-col box-border"
      style={{
        height: '100dvh',
        paddingTop: headerOffset,
      }}
    >
      <GridLayout
        tracks={tracks}
        className="flex-1 min-h-0"
        style={{
          height: `calc(100dvh - ${headerOffset} - var(--lk-control-bar-height, 72px))`,
        }}
      >
        <ParticipantTile />
      </GridLayout>
      <ControlBar />
    </div>
  )
}
