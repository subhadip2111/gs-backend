const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const privateKey = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7RVZGW2wTq7pJ\nH0DL9uYA/R8QFXNnn6k1jhLPoGnUqiTDbweqjPWQ1KCtHG3X7QolWkh4uToWtEx+\nks1AbWoK9XikB1iMCYYCjW7MPso8GYh+6BRefNfBiae54zCkDdOapvzTAuhY2r47\nl1pLI8GAXobvZBUlvHCStP0y5t+xfB3iRzRUxqWYWKTM203SECd2AcOk0/zK0J45\nnBneLfP62ENW4AqhxEorZVdanM3Cry/KpPiVxxbDzpLvHttFfDzeaf2xoakqfBlX\ngLOcXjoRaV6bx8tbj+N0Gx2jscbRcHFuy+0FLp1VNCzHAnunIsCMtHl9qXC31MZq\nZfZ6BInLAgMBAAECggEAE6h2I4GSSUhUEDvzIdYDk+P+QEJ4ME7+xKvqxpfItDW+\nETPVAq60UmU3jqR21V1BHOWqyN1svxhjFUBUwmgZ4xecd997iIuxYRA2qsMGmKN3\nhBbZmIeTYHISRL2YDAiVh1zzGjVqbXVc1cWQCWYx+Ecz8+o2HBV5XbUZBSBeJ/O4\nl++L12vG06ow1LrPvWcdbSs8PLZl+eKzPlpzg/CXkmCsed8Br6O2iYcD2ijHD2Xy\nbkFoqRiecBM/ZaAPzBrHLztL3Cw2/DMn19wP0xTessjzzfQw0h3CTEb5juwyWfTi\nYtQIS7uD8eyM9z4ZDxYWfzI/aSsHq/qfc9LEfYzCnQKBgQD5AHMZJer0e3NJKeoq\L6pDbomDChY8CkIa3LsEMPvEIUPEPes5H0zGc/AUUpVdjkF2K7imDaOzdJr3KN19\nWOfSuw8f7I9ldNPCp7xeyTz6h9pQb2mcCeqHVijFOn4AWQSTfWD5ctXOjb150bx+\np0XXRLd+iMRAgcYCC9OGBXuiLQKBgQDAiLzgJbyhE6EmBFbNtDDVMIu3vZqUoHRs\nNwcCMzrNEmADrqRrc0T+HdhOWx5fD+eej2ShxkpdwfAbYQ8PI9+9Uz9c+u7VMXAl\nmndxyffutQROnAENM+RYJw2vBpS4kOXo21ql4bol0f6tAwoaWlalsZFzxL7BGITc\npvp47YBu1wKBgQDs9xmSKDy2mDl5ulLn/N6bN7nUJChO0TBh4gh0j6051LJqMscF\nYJ0vC6zBmmodU8FGlYsvNDHDGchUSOaoYJCWQoC9T+KTmh/g0sJ4rijC/8Cq5axq\n3CD+1OcN84FwEUdCmYJNQpTo8okMQqaRHd1gZTv/RmcGQLpQvjJ6DAPBrQKBgGM4\nlI23JOSl5xBegBV2XQwg/n/sWHNr1VPHb/c0S4NPiuea4uT0/IMxAj4vOxGmcqkG\nIMg2FjEHNyQE+uvEgxNgiXDzaI258p+OYSvk976uzs9sGiahrXW4epbOf2o2UiWU\nlbyS/YlsFSE4Rcaa87hkMB9HLz730dCcxMv5KYz1AoGAEEu3oiQI9DDRl4C6DaZc\nJZpGakofwpok/odN7l4PcPEs4794iTmlvZKjipEw+WZ1X+aDKSWcYqYJfZGyqwFY\n7Kl59qn8pmo93mRz/QJUb+pAgmDn4exSr31s5ICWt1oeRsufcs+kop82a5ULXUH9\nyAYbL1IPVmV0+1ZQVIfdvzw=\n-----END PRIVATE KEY-----\n`;

const escapedKey = privateKey.replace(/\\n/g, '\\\\n'); // Double escape for .env if needed
// Actually, let's just use single line with literal \n
const singleLineKey = privateKey.replace(/\n/g, '\\n');

const regex = /FIREBASE_PRIVATE_KEY=.*/;
if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `FIREBASE_PRIVATE_KEY="${singleLineKey}"`);
} else {
    envContent += `\nFIREBASE_PRIVATE_KEY="${singleLineKey}"\n`;
}

fs.writeFileSync(envPath, envContent);
console.log('Fixed .env FIREBASE_PRIVATE_KEY');
