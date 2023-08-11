import { GraphQLError } from "graphql"
import { getJobs, getJob, getJobsByCompany, createJob, deleteJob, updateJob } from "./db/jobs.js"
import { getCompany } from "./db/companies.js"

export const resolvers = {
    Query: {
        jobs: async () => await getJobs(),
        job: async (_root, { id }) => {
            const job = await getJob(id)

            if (!job) {
                throw notFoundError("No job was found with the ID: " + id)
            } else {
                return job
            }
        },
        company: async (_root, { id }) => {
            const company = await getCompany(id)

            if (!company) {
                throw new GraphQLError("No company was found with the ID: " + id, {
                    extensions: {code: "NOT_FOUND"}
                })
            } else {
                return company
            }
        }
    },

    // Field resolvers
    Job: {
        company: (job) => getCompany(job.companyId),
        date: (job) => toIsoDate(job.createdAt)
    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id),
    },

    Mutation: {
        createJob: (_root, { input: { title, description } },  { user }) => {
            if (!user) {
                throw unauthorizedError("User not authorized")
            }
            console.log("user is: ", user)
            return null

            //return createJob({ companyId: user.companyId, title, description })
        },

        deleteJob: (_root, {id}) => deleteJob(id),

        updateJob: (_root, { input: { id, title, description } }) => {
            return updateJob({ id, title, description })
        },
    }
}

// Helper functions
function toIsoDate(value) {
    return value.slice(0, "yyyy-mm-dd".length)
}

function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: {code: "NOT_FOUND"}
    })
}

function unauthorizedError(message) {
    return new GraphQLError(message, {
        extensions: {code: "UNAUTHORIZED"}
    })
}