/**
 * Represents contact information for a student service.
 */
export interface StudentServiceContact {
  /**
   * The name of the service.
   */
  name: string;
  /**
   * The email address of the service.
   */
  email: string;
  /**
   * The phone number of the service.
   */
  phone: string;
  /**
   * The office location of the service.
   */
  office: string;
  /**
   * The office hours of the service.
   */
  officeHours: string;
}

/**
 * Asynchronously retrieves contact information for student services.
 *
 * @returns A promise that resolves to an array of StudentServiceContact objects.
 */
export async function getStudentServicesContactInfo(): Promise<StudentServiceContact[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      name: 'Student Admissions',
      email: 'admissions@h-brs.de',
      phone: '+49 2241 865 0',
      office: 'A1.01',
      officeHours: 'Mon-Fri 9:00-12:00',
    },
    {
      name: 'Student Advisory',
      email: 'advisory@h-brs.de',
      phone: '+49 2241 865 111',
      office: 'B2.12',
      officeHours: 'Tue-Thu 14:00-16:00',
    },
  ];
}
