const fs = require('fs');
const path = require('path');

const userDir = process.argv[2];
const DIR = userDir ? path.resolve(userDir) : path.join(__dirname, '../../performance-reports/manual');

function getLatestMobileReport() {
    if (!fs.existsSync(DIR)) return null;
    
    const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
    let latestReport = null;
    let latestTime = 0;

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(DIR, file), 'utf-8');
            const json = JSON.parse(content);
            
            // Check if Mobile
            const formFactor = json.configSettings?.formFactor || json.environment?.hostFormFactor;
            if (formFactor !== 'mobile') continue;

            const time = new Date(json.fetchTime).getTime();
            if (time > latestTime) {
                latestTime = time;
                latestReport = json;
            }
        } catch (e) {}
    }
    return latestReport;
}

function analyze() {
    console.log('🔍 Diagnosticando último relatório Mobile...\n');
    const report = getLatestMobileReport();

    if (!report) {
        console.log('❌ Nenhum relatório mobile encontrado.');
        return;
    }

    console.log(`📅 Data: ${report.fetchTime}`);
    console.log(`📱 User Agent: ${report.environment?.networkUserAgent}\n`);

    // 1. CLS Analysis
    const cls = report.audits['cumulative-layout-shift'];
    const layoutShifts = report.audits['layout-shifts']?.details?.items || [];
    
    console.log(`📐 CLS Score: ${cls.displayValue} (${cls.numericValue.toFixed(3)})`);
    if (layoutShifts.length > 0) {
        console.log('   Elementos que se moveram:');
        layoutShifts.forEach(item => {
            // Simplify node snippet
            const node = item.node?.snippet || 'Unknown node';
            console.log(`   - Score: ${item.score.toFixed(4)} | ${node}`);
        });
    } else {
        console.log('   ✅ Nenhum shift detectado neste relatório.');
    }
    console.log('');

    // 2. TBT Analysis
    const tbt = report.audits['total-blocking-time'];
    const blockingTasks = report.audits['long-tasks']?.details?.items || [];

    console.log(`⏱️  TBT Score: ${tbt.displayValue} (${Math.round(tbt.numericValue)}ms)`);
    console.log('   Tarefas Longas (>50ms):');
    
    // Sort by duration desc
    const sortedTasks = blockingTasks.sort((a, b) => b.duration - a.duration).slice(0, 5);
    
    sortedTasks.forEach(task => {
        console.log(`   - ${Math.round(task.duration)}ms | ${task.url || 'Script Inline/Interno'}`);
    });

    // 3. Main Thread Breakdown
    const breakdown = report.audits['mainthread-work-breakdown']?.details?.items || [];
    console.log('\n🧠 Trabalho da Thread Principal (Top 3):');
    breakdown.slice(0, 3).forEach(item => {
        console.log(`   - ${item.groupLabel}: ${Math.round(item.duration)}ms`);
    });
}

analyze();
