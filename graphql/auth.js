const { defaultFieldResolver } = require('graphql');
const { ForbiddenError, AuthenticationError } = require('apollo-server-express');

const authDirective = (schema) => {
  return {
    auth: {
      typeDefs: `directive @auth(requires: String) on FIELD_DEFINITION`,
      transformer: (schema) => {
        const typeMap = schema.getTypeMap();
        
        Object.values(typeMap).forEach((type) => {
          if (type.astNode?.fields) {
            type.astNode.fields.forEach((field) => {
              const authDirective = field.directives?.find(d => d.name.value === 'auth');
              if (authDirective) {
                const requires = authDirective.arguments?.find(a => a.name.value === 'requires')?.value.value;
                
                const fieldConfig = type.getFields()[field.name.value];
                const originalResolve = fieldConfig.resolve || defaultFieldResolver;
                
                fieldConfig.resolve = async (source, args, context, info) => {
                  if (!context.user) {
                    throw new AuthenticationError('Not authenticated');
                  }
                  
                  if (requires && context.user.role !== requires) {
                    throw new ForbiddenError(`Requires ${requires} role`);
                  }
                  
                  return originalResolve(source, args, context, info);
                };
              }
            });
          }
        });
        
        return schema;
      }
    }
  };
};

module.exports = authDirective;