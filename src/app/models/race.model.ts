import { Penalty, PenaltyType } from "./penalty.model";
import { Lap } from "./lap.model";
import { Session } from "./session.model";
import { Sector } from "./sector.model";

export function allRaceExportFields(): string[] {
    return ['race'].concat(Race.exportFields(), Session.exportFields(), Lap.exportFields(), Sector.exportFields(), Penalty.exportFields(), PenaltyType.exportFields());
}

export class Race {
    best: Lap;
    sessions: Session[] = [];
    allLaps: Lap[] = [];
    sessionBuffer: number = 15;

    static exportFields(): string[] {
        return ['sessions', 'sessionBuffer'];
    }

    static fromJson(data: any): Race {
        const race = new Race();
        race.sessionBuffer = data.sessionBuffer;
        race.sessions = data.sessions.map((session: any) => Session.fromJson(session));

        race.allLaps = race.sessions.flatMap((session: Session) => session.laps);

        return race;
    }
}
