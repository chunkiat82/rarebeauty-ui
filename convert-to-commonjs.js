const fs = require('fs');
const path = require('path');

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Convert named imports with aliases
  content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g, (match, imports, module) => {
    const cleanImports = imports
      .split(',')
      .map(i => {
        const parts = i.trim().split(/\s+as\s+/);
        return parts.length > 1 ? `${parts[1]}: ${parts[0]}` : i.trim();
      })
      .join(', ');
    
    module = module.replace(/\.js$/, '');
    return `const { ${cleanImports} } = require('${module}');`;
  });
  
  // Convert default imports
  content = content.replace(/import\s+([^{}\s]+)\s+from\s+['"]([^'"]+)['"];?/g, (match, name, module) => {
    module = module.replace(/\.js$/, '');
    return `const ${name} = require('${module}');`;
  });
  
  // Convert export default function declarations
  content = content.replace(/export\s+default\s+function\s+([^(]+)/g, 'function $1');
  
  // Convert export default class declarations
  content = content.replace(/export\s+default\s+class\s+([^{]+)/g, 'class $1');
  
  // Convert named exports
  content = content.replace(/export\s+function\s+([^(]+)/g, 'function $1');
  content = content.replace(/export\s+const\s+([^=]+)/g, 'const $1');
  content = content.replace(/export\s+let\s+([^=]+)/g, 'let $1');
  content = content.replace(/export\s+class\s+([^{]+)/g, 'class $1');
  
  // Convert export default expressions
  content = content.replace(/export\s+default\s+([^;\n]+);?/g, (match, expr) => {
    // If the expression is just an identifier, export it directly
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr.trim())) {
      return `module.exports = ${expr};`;
    }
    // Otherwise, it's a more complex expression
    return `module.exports = ${expr};`;
  });
  
  // Convert export { x } from 'module'
  content = content.replace(/export\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"];?/g, (match, exports, module) => {
    const cleanExports = exports
      .split(',')
      .map(e => {
        const parts = e.trim().split(/\s+as\s+/);
        return parts.length > 1 ? `${parts[1]}: ${parts[0]}` : e.trim();
      })
      .join(', ');
    
    module = module.replace(/\.js$/, '');
    return `module.exports = require('${module}');`;
  });
  
  // Convert export { x }
  content = content.replace(/export\s*{\s*([^}]+)\s*};?/g, (match, exports) => {
    const cleanExports = exports
      .split(',')
      .map(e => {
        const parts = e.trim().split(/\s+as\s+/);
        return parts.length > 1 ? `${parts[1]}: ${parts[0]}` : e.trim();
      })
      .join(', ');
    
    return `module.exports = { ${cleanExports} };`;
  });
  
  // Convert GraphQL type aliases
  content = content.replace(/GraphQLObjectType as ObjectType/g, 'GraphQLObjectType');
  content = content.replace(/GraphQLString as StringType/g, 'GraphQLString');
  content = content.replace(/GraphQLNonNull as NonNull/g, 'GraphQLNonNull');
  content = content.replace(/GraphQLList as ListType/g, 'GraphQLList');
  content = content.replace(/GraphQLBoolean as BooleanType/g, 'GraphQLBoolean');
  content = content.replace(/GraphQLInt as IntegerType/g, 'GraphQLInt');
  content = content.replace(/GraphQLFloat as FloatType/g, 'GraphQLFloat');
  
  // Update type instantiations
  content = content.replace(/new ObjectType/g, 'new GraphQLObjectType');
  content = content.replace(/new NonNull/g, 'new GraphQLNonNull');
  content = content.replace(/new ListType/g, 'new GraphQLList');
  content = content.replace(/type: StringType/g, 'type: GraphQLString');
  content = content.replace(/type: BooleanType/g, 'type: GraphQLBoolean');
  content = content.replace(/type: IntegerType/g, 'type: GraphQLInt');
  content = content.replace(/type: FloatType/g, 'type: GraphQLFloat');
  
  fs.writeFileSync(filePath, content);
  console.log(`Converted ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      convertFile(filePath);
    }
  });
}

// Convert all files in the specified directories
const directories = [
  path.join(__dirname, 'src', 'data'),
  path.join(__dirname, 'src', 'api'),
  path.join(__dirname, 'src', 'hooks')
];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}); 