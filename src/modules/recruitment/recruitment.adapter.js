const { unpackRelational } = require('../common/relational.helper');

class RecruitmentAdapter {
  toDTO(record) {
    if (!record) return null;

    const job = unpackRelational(record.job_id);
    const department = unpackRelational(record.department_id);
    const stage = unpackRelational(record.stage_id);

    return {
      id: record.id,
      name: record.name,
      applicantName: record.partner_name,
      email: record.email_from,
      jobId: job.id,
      jobTitle: job.name,
      departmentId: department.id,
      departmentName: department.name,
      stageId: stage.id,
      stageName: stage.name,
      createdAt: record.create_date
    };
  }

  toDTOArray(records) {
    return Array.isArray(records) ? records.map((rec) => this.toDTO(rec)) : [];
  }

  toOdooFormat(data) {
    if (!data) return null;

    return {
      name: data.name,
      partner_name: data.applicantName,
      email_from: data.email,
      job_id: data.jobId,
      department_id: data.departmentId,
      stage_id: data.stageId
    };
  }
}

module.exports = RecruitmentAdapter;
