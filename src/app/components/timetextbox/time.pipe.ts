import { Pipe, PipeTransform } from "@angular/core";
import { Rounder } from "../../services/rounder.service";
import { formatNumber } from "@angular/common";

@Pipe({
    name: 'time'
})
export class TimePipe implements PipeTransform {
    transform(value: number, ...args: any[]): string {
        let output = '';
        const displayFullFormat = args?.[0] ?? false;

        if (value != null && value >= 0) {
            if (value > 3600 || displayFullFormat) {
                const hours = Math.trunc(value / 3600.0);
                output += formatNumber(hours, 'en-US', '2.0') + ':';
                value -= hours * 3600;
            }
            if (value > 60 || displayFullFormat) {
                const minutes = Math.trunc(value / 60.0);
                output += formatNumber(minutes, 'en-US', '2.0') + ':';
                value -= minutes * 60;
            }

            if (output.length > 0) {
                output += formatNumber(Rounder.round(value, 3), 'en-US', '2.3');
            } else {
                output += Rounder.round(value, 3).toFixed(3);
            }
        }
        return output;
    }
}