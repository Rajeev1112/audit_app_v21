export class commonHelper {

    static ssnNoFormat(ssn: string): string {
        const pattern = /\d{3}-\d{2}-\d{4}/g;
        let formattedSSN = ssn as any;
        const result = pattern.test(formattedSSN);

        if (!result) {
            formattedSSN = formattedSSN.match(/\d*/g).join('')
                .match(/(\d{0,3})(\d{0,2})(\d{0,4})/).slice(1).join('-').replace(/-*$/g, '');
        }

        return formattedSSN;
    }

    static zipCodeFormat(zipCode: string): string {
        const pattern = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
        let formattedZip = zipCode as any;
        const result = pattern.test(formattedZip);

        if (!result) {
            formattedZip = formattedZip.match(/\d*/g).join('')
                .match(/(\d{0,5})(\d{0,4})/).slice(1).join('-').replace(/-*$/g, '');
        }

        return formattedZip;
    }
}