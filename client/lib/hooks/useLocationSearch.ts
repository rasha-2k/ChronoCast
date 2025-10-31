import { useCallback, useState, useEffect } from "react";
import { DateObject } from "react-multi-date-picker";

export const useDateValidation = (values: (DateObject | string | Date | null)[]) => {
    const [dateValidationError, setDateValidationError] = useState<string | null>(null);

    const validateDateRange = useCallback((dateValues: (DateObject | string | Date | null)[]): string | null => {
        if (!dateValues || dateValues.length === 0) {
            return 'Please select at least one date';
        }

        const today = new Date();
        const maxFuture = new Date();
        maxFuture.setDate(today.getDate() + 16);
        const minPast = new Date();
        minPast.setMonth(today.getMonth() - 3);

        const toYYYYMMDD = (v: DateObject | string | Date) =>
            v instanceof DateObject ? v.format("YYYY-MM-DD") : new DateObject(v).format("YYYY-MM-DD");

        const validDates = dateValues.filter(Boolean) as (DateObject | string | Date)[];

        if (validDates.length === 1) {
            const date = new Date(toYYYYMMDD(validDates[0]));
            if (date < minPast) return 'Date cannot be more than 3 months in the past';
            if (date > maxFuture) return 'Date cannot be more than 16 days in the future';
        } else if (validDates.length === 2) {
            const startDate = new Date(toYYYYMMDD(validDates[0]));
            const endDate = new Date(toYYYYMMDD(validDates[1]));

            if (startDate > endDate) return 'Start date must be before end date';
            if (startDate < minPast) return 'Start date cannot be more than 3 months in the past';
            if (endDate > maxFuture) return 'End date cannot be more than 16 days in the future';
        }

        return null;
    }, []);

    useEffect(() => {
        const validationError = validateDateRange(values);
        setDateValidationError(validationError);
    }, [values, validateDateRange]);

    return { dateValidationError, validateDateRange };
};