import { Penalty, PenaltyType } from "./penalty.model";
import { Lap } from "./lap.model";
import { Session } from "./session.model";
import { Sector } from "./sector.model";

export function allRaceExportFields(): string[] {
    return ['race'].concat(Race.exportFields(), Session.exportFields(), Lap.exportFields(), Sector.exportFields(), Penalty.exportFields(), PenaltyType.exportFields());
}

export enum TimeReference {
    ABSOLUTE = "Absolute",
    RELATIVE = "Relative"
}

export class Race {
    best: Lap;
    sessions: Session[] = [];
    allLaps: Lap[] = [];
    sessionBuffer: number = 15;
    lapSelect: string = "bestGhost";

    static exportFields(): string[] {
        return ['sessions', 'sessionBuffer', 'lapSelect'];
    }

    public importFromJson(data: any): void {
        if (data.sessionBuffer != null) {
            this.sessionBuffer = data.sessionBuffer;
        }
        if (data.lapSelect != null) {
            this.lapSelect = data.lapSelect;
        }
        if (data.sessions != null) {
            this.sessions.forEach((session: Session, sessionIndex: number) => {
                if (sessionIndex < data.sessions.length) {
                    session.importFromJson(data.sessions[sessionIndex]);
                }
            });
            if (data.sessions.length > this.sessions.length) {
                this.sessions.push(...data.sessions.slice(this.sessions.length));
            }
        }

        this.allLaps = this.sessions.flatMap((session: Session) => session.laps);
    }
}
